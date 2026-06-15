package com.example.ticket.presentation.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private String userId; // Or email/phone if available
    private String type; // TICKET_BOOKED, TICKET_CANCELLED
    private String title;
    private String message;
    private Object payload; // Can store ticketId etc
}
