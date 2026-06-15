package com.example.notification.presentation.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailUpdateDTO {
    private String recipient;
    private String subject;
    private String body;
    private String status;
}
