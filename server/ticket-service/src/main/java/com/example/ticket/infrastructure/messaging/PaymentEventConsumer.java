package com.example.ticket.infrastructure.messaging;

import com.example.ticket.application.TicketService;
import com.example.ticket.infrastructure.config.KafkaConfig;
import com.example.ticket.presentation.dto.event.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final TicketService ticketService;

    @KafkaListener(topics = KafkaConfig.PAYMENT_EVENTS_TOPIC, groupId = "ticket-service-group")
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Received payment event from Kafka: {}", event);
        try {
            ticketService.handlePaymentEvent(event);
        } catch (Exception e) {
            log.error("Error handling payment event: {}", e.getMessage(), e);
            // In a real system, you might want to send to a DLQ (Dead Letter Queue)
        }
    }
}
