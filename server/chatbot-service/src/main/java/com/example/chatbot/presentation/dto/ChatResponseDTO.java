package com.example.chatbot.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponseDTO {
    private String intent;
    private String reply;
    private Object data;
    private Object collected;
    private Object missing;
}
