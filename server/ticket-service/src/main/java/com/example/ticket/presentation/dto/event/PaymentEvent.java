package com.example.ticket.presentation.dto.event;

import com.example.ticket.domain.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private Long sepayId;
    private Integer ticketId;
    private PaymentStatus status; // COMPLETED or FAILED
    private BigDecimal amount;
    private String content;
    private String description;
}
