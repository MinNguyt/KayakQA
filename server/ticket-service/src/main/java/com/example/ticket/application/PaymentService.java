package com.example.ticket.application;

import com.example.ticket.domain.model.Payment;
import com.example.ticket.domain.model.PaymentStatus;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.PaymentRepository;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.infrastructure.messaging.PaymentEventProducer;
import com.example.ticket.presentation.dto.SePayWebhookDTO;
import com.example.ticket.presentation.dto.event.PaymentEvent;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final PaymentEventProducer paymentEventProducer;

    @Transactional
    public void processSePayWebhook(SePayWebhookDTO payload) {
        log.info("Processing SePay webhook for SePay ID: {}", payload.getId());

        // Check if payment already processed
        Optional<Payment> existingPayment = paymentRepository.findBySepayId(payload.getId());
        if (existingPayment.isPresent()) {
            log.info("Payment already processed for SePay ID: {}", payload.getId());
            return;
        }

        // Parse ticket ID
        Integer ticketId = extractTicketId(payload.getContent());
        if (ticketId == null) {
            log.error("Could not extract ticket ID from content: {}", payload.getContent());
            return;
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        Payment payment = Payment.builder()
                .ticket(ticket)
                .sepayId(payload.getId())
                .gateway(payload.getGateway())
                // .transactionDate(...) // Parse if needed
                .accountNumber(payload.getAccountNumber())
                .code(payload.getCode())
                .content(payload.getContent())
                .transferType(payload.getTransferType())
                .transferAmount(payload.getTransferAmount())
                .accumulated(payload.getAccumulated())
                .subAccount(payload.getSubAccount())
                .referenceCode(payload.getReferenceCode())
                .description(payload.getDescription())
                .status(PaymentStatus.COMPLETED) // Assume success if webhook received
                .build();

        paymentRepository.save(payment);

        // Determine if payment is successful/sufficient
        PaymentStatus eventStatus = PaymentStatus.COMPLETED;
        if (ticket.getTotalPrice() == BigDecimal.valueOf(2000)) {
            eventStatus = PaymentStatus.COMPLETED;
        } else {
            log.warn("Payment amount {} is less than ticket price {} for ticket {}",
                    payload.getTransferAmount(), ticket.getTotalPrice(), ticketId);
        }

        // Publish event to Kafka
        PaymentEvent event = PaymentEvent.builder()
                .sepayId(payload.getId())
                .ticketId(ticketId)
                .status(eventStatus)
                .amount(payload.getTransferAmount())
                .content(payload.getContent())
                .description(payload.getDescription())
                .build();

        paymentEventProducer.sendPaymentEvent(event);
    }

    private Integer extractTicketId(String content) {
        // Extract ticket ID from "DH<ticketId>" pattern at the beginning of content
        // Example: "DH2 FT26036954350390..." -> extracts "2"
        try {
            if (content == null || content.isEmpty()) {
                return null;
            }

            // Match "DH" followed by digits at the start of the content
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^DH(\\d+)");
            java.util.regex.Matcher matcher = pattern.matcher(content.trim());

            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }

            log.warn("Content does not match expected 'DH<ticketId>' pattern: {}", content);
            return null;
        } catch (Exception e) {
            log.error("Error extracting ticket ID from content: {}", content, e);
            return null;
        }
    }
}
