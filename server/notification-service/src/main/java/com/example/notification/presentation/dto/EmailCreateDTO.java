package com.example.notification.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailCreateDTO {
    @NotNull
    @NotBlank
    private String recipient;
    @NotNull
    @NotBlank
    private String subject;
    @NotNull
    private String body;
}
