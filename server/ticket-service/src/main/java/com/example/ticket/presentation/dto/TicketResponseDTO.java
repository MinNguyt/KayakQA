package com.example.ticket.presentation.dto;

import com.example.ticket.domain.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {
    private Integer id;
    private Integer user_id;
    private Integer schedule_id;
    private Integer seat_id;
    private BigDecimal total_price;
    private TicketStatus status;
    private String cancel_reason;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    private PaymentDTO payment;
}
