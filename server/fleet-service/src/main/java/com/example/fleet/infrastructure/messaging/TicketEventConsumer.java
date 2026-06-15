package com.example.fleet.infrastructure.messaging;

import com.example.fleet.application.SeatService;
import com.example.fleet.domain.model.Seat;
import com.example.fleet.infrastructure.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes ticket events from Kafka to update seat status in fleet-service.
 * When a ticket is BOOKED, the corresponding seat is marked as BOOKED.
 * When a ticket is CANCELLED, the seat is marked as AVAILABLE again.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TicketEventConsumer {

    private final SeatService seatService;

    @KafkaListener(topics = KafkaConfig.TICKET_EVENTS_TOPIC, groupId = "fleet-service-group", containerFactory = "kafkaListenerContainerFactory")
    public void handleTicketEvent(TicketEvent event) {
        log.info("Received ticket event from Kafka: {}", event);

        try {
            if (event.getSeatId() == null) {
                log.warn("Ticket event has no seatId, skipping: {}", event);
                return;
            }

            switch (event.getEventType()) {
                case "TICKET_BOOKED":
                    log.info("Processing TICKET_BOOKED event for seat {}", event.getSeatId());
                    seatService.updateSeatStatusFromTicketEvent(event.getSeatId(), Seat.SeatStatus.BOOKED);
                    break;

                case "TICKET_CANCELLED":
                    log.info("Processing TICKET_CANCELLED event for seat {}", event.getSeatId());
                    seatService.updateSeatStatusFromTicketEvent(event.getSeatId(), Seat.SeatStatus.AVAILABLE);
                    break;

                default:
                    log.debug("Ignoring ticket event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Error processing ticket event: {}", e.getMessage(), e);
            // In production, consider sending to a DLQ for retry
        }
    }
}
