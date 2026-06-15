package com.example.notification.presentation.dto;

import java.time.LocalDateTime;

import com.example.notification.domain.model.EmailStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailResponseDTO {
    private String recipient;
    private String subject;
    private String body;
    private EmailStatus status;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
