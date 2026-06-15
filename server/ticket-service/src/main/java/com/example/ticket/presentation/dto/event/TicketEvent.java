package com.example.ticket.presentation.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published to Kafka when a ticket status changes.
 * Consumed by fleet-service to update seat status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketEvent {
    private Integer ticketId;
    private Integer seatId;
    private Integer scheduleId;
    private Integer userId;
    private String status; // BOOKED, CANCELLED, PENDING
    private String eventType; // TICKET_BOOKED, TICKET_CANCELLED
}
