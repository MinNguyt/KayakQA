package com.example.ticket.infrastructure.messaging;

import com.example.ticket.infrastructure.config.RabbitMQConfig;
import com.example.ticket.presentation.dto.event.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(NotificationMessage message) {
        try {
            log.info("Sending notification message to RabbitMQ: {}", message);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                    message);
            log.debug("Notification message sent successfully for user {}", message.getUserId());
        } catch (Exception e) {
            // Graceful degradation - log error but don't fail the operation
            log.warn("Failed to send notification to RabbitMQ (RabbitMQ may be unavailable): {}", e.getMessage());
        }
    }
}
