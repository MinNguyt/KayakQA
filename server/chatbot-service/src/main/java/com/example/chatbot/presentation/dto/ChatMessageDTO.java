package com.example.chatbot.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "User ID is required")
    private Integer userId;
}
