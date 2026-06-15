package com.example.ticket.application;

import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.presentation.dto.PaginatedResponse;
import com.example.ticket.presentation.dto.TicketCreateDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.ticket.domain.model.PaymentStatus;
import com.example.ticket.infrastructure.messaging.NotificationProducer;
import com.example.ticket.infrastructure.messaging.TicketEventProducer;
import com.example.ticket.infrastructure.service.RedisLockService;
import com.example.ticket.presentation.dto.event.NotificationMessage;
import com.example.ticket.presentation.dto.event.PaymentEvent;
import com.example.ticket.presentation.dto.event.TicketEvent;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final RedisLockService redisLockService;
    private final NotificationProducer notificationProducer;
    private final TicketEventProducer ticketEventProducer;

    @Transactional
    public Ticket createTicket(TicketCreateDTO dto, Integer userId) {
        log.info("Creating ticket for user {} schedule {} seat {}", userId, dto.getSchedule_id(), dto.getSeat_id());

        // 1. Acquire Redis Lock (5 min TTL)
        boolean locked = redisLockService.tryLock(dto.getSchedule_id(), dto.getSeat_id(), 5);
        if (!locked) {
            throw new RuntimeException("Seat is currently locked by another user. Please try again later.");
        }

        // 2. Check DB for booked status (double check)
        Optional<Ticket> ticketTest = ticketRepository.findByScheduleIdAndSeatId(dto.getSchedule_id(),
                dto.getSeat_id());
        // .orElseThrow(() -> new ResourceNotFoundException("not found ticket with seat
        // id" + dto.getSeat_id()));

        ticketTest.ifPresent(t -> {
            // If already booked implies lock was for a new booking that finished, or just
            // concurrency races
            if (t.getStatus() == TicketStatus.BOOKED) {
                redisLockService.releaseLock(dto.getSchedule_id(), dto.getSeat_id());
                throw new RuntimeException("Seat already booked");
            }

        });

        try {
            Ticket ticket = Ticket.builder()
                    .userId(userId)
                    .scheduleId(dto.getSchedule_id())
                    .seatId(dto.getSeat_id())
                    .totalPrice(dto.getPrice())
                    .status(TicketStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            return ticketRepository.save(ticket);
        } catch (Exception e) {
            // Release lock if DB save fails
            redisLockService.releaseLock(dto.getSchedule_id(), dto.getSeat_id());
            throw e;
        }
    }

    @Transactional
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Handling payment event for ticket: {}", event.getTicketId());
        // log.info("Handling payment event for ticket: {}", event.toString());
        Ticket ticket = getTicket(event.getTicketId());

        if (event.getStatus() == PaymentStatus.COMPLETED) {
            ticket.setStatus(TicketStatus.BOOKED);
            ticketRepository.save(ticket);

            // Release lock finally
            redisLockService.releaseLock(ticket.getScheduleId(), ticket.getSeatId());

            // Publish ticket booked event to Kafka for fleet-service
            publishTicketEvent(ticket, "TICKET_BOOKED");

            // Send Notification
            NotificationMessage msg = NotificationMessage.builder()
                    .userId(String.valueOf(ticket.getUserId()))
                    .type("TICKET_BOOKED")
                    .title("Booking Confirmed")
                    .message("Your ticket #" + ticket.getId() + " has been confirmed.")
                    .payload(ticket)
                    .build();
            notificationProducer.sendNotification(msg);

        } else {
            ticket.setStatus(TicketStatus.PENDING);
            ticket.setCancelReason("Payment Failed: " + event.getDescription());
            ticketRepository.save(ticket);

            // Release lock to free seat
            redisLockService.releaseLock(ticket.getScheduleId(), ticket.getSeatId());

            // Publish ticket cancelled event to Kafka for fleet-service
            publishTicketEvent(ticket, "TICKET_CANCELLED");
        }
    }

    public Ticket getTicket(Integer id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getUserTickets(Integer userId) {
        return ticketRepository.findByUserId(userId);
    }

    public PaginatedResponse<Ticket> getAllTickets(int page, int limit, TicketStatus status) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Ticket> ticketPage;

        if (status != null) {
            ticketPage = ticketRepository.findByStatus(status, pageRequest);
        } else {
            ticketPage = ticketRepository.findAll(pageRequest);
        }

        return PaginatedResponse.<Ticket>builder()
                .results(ticketPage.getContent())
                .total(ticketPage.getTotalElements())
                .page(page)
                .limit(limit)
                .build();
    }

    @Transactional
    public Ticket updateTicket(Integer id, Ticket updates) {
        Ticket ticket = getTicket(id);
        TicketStatus previousStatus = ticket.getStatus();

        if (updates.getStatus() != null) {
            ticket.setStatus(updates.getStatus());
        }

        if (updates.getCancelReason() != null) {
            ticket.setCancelReason(updates.getCancelReason());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);

        // Handle cancellation: release lock and notify fleet-service
        if (updates.getStatus() == TicketStatus.CANCELLED && previousStatus != TicketStatus.CANCELLED) {
            log.info("Ticket {} cancelled by user, releasing lock and notifying fleet-service", id);

            // Release Redis lock to free the seat
            redisLockService.releaseLock(ticket.getScheduleId(), ticket.getSeatId());

            // Publish ticket cancelled event to Kafka for fleet-service
            publishTicketEvent(savedTicket, "TICKET_CANCELLED");

            // Send cancellation notification
            NotificationMessage msg = NotificationMessage.builder()
                    .userId(String.valueOf(ticket.getUserId()))
                    .type("TICKET_CANCELLED")
                    .title("Ticket Cancelled")
                    .message("Your ticket #" + ticket.getId() + " has been cancelled.")
                    .payload(savedTicket)
                    .build();
            notificationProducer.sendNotification(msg);
        }

        return savedTicket;
    }

    /**
     * Publishes a ticket event to Kafka for consumption by fleet-service.
     * This allows fleet-service to update seat status when tickets are booked or
     * cancelled.
     */
    private void publishTicketEvent(Ticket ticket, String eventType) {
        TicketEvent event = TicketEvent.builder()
                .ticketId(ticket.getId())
                .seatId(ticket.getSeatId())
                .scheduleId(ticket.getScheduleId())
                .userId(ticket.getUserId())
                .status(ticket.getStatus().name())
                .eventType(eventType)
                .build();

        ticketEventProducer.sendTicketEvent(event);
    }
}
