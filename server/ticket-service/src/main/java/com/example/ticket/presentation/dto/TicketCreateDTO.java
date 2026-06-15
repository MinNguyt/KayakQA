package com.example.ticket.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreateDTO {
    private Integer schedule_id;
    private Integer seat_id;
    private BigDecimal price; // Add price validation on server side in real app
}
