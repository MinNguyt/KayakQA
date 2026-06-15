package com.example.ticket.infrastructure.messaging;

import com.example.ticket.infrastructure.config.KafkaConfig;
import com.example.ticket.presentation.dto.event.TicketEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Produces ticket events to Kafka when ticket status changes.
 * These events are consumed by fleet-service to update seat status.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TicketEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendTicketEvent(TicketEvent event) {
        try {
            log.info("Publishing ticket event to Kafka: {}", event);
            kafkaTemplate.send(KafkaConfig.TICKET_EVENTS_TOPIC, String.valueOf(event.getTicketId()), event);
            log.debug("Ticket event published successfully for ticket {}", event.getTicketId());
        } catch (Exception e) {
            // Graceful degradation - log error but don't fail the operation
            log.warn("Failed to publish ticket event to Kafka (Kafka may be unavailable): {}", e.getMessage());
        }
    }
}
