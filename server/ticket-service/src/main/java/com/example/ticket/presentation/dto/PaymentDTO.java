package com.example.ticket.presentation.dto;

import com.example.ticket.domain.model.PaymentStatus;
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
public class PaymentDTO {
    private Integer id;
    private Long sepay_id;
    private String gateway;
    private LocalDateTime transaction_date;
    private String account_number;
    private String code;
    private String content;
    private String transfer_type;
    private BigDecimal transfer_amount;
    private BigDecimal accumulated;
    private String sub_account;
    private String reference_code;
    private String description;
    private PaymentStatus status;
}
