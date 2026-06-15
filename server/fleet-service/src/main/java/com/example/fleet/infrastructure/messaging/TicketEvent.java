package com.example.fleet.infrastructure.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event received from ticket-service when a ticket status changes.
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
