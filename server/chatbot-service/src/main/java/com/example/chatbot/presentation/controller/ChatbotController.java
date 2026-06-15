package com.example.chatbot.presentation.controller;

import com.example.chatbot.application.ChatbotService;
import com.example.chatbot.presentation.dto.ApiResponse;
import com.example.chatbot.presentation.dto.ChatMessageDTO;
import com.example.chatbot.presentation.dto.ChatResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatResponseDTO>> sendMessage(
            @Valid @RequestBody ChatMessageDTO request) {

        log.info("Chatbot message from user {}: {}", request.getUserId(), request.getMessage());

        Map<String, Object> result = chatbotService.processMessage(
                request.getMessage(), request.getUserId());

        ChatResponseDTO response = ChatResponseDTO.builder()
                .intent((String) result.get("intent"))
                .reply((String) result.get("reply"))
                .data(result.get("data"))
                .collected(result.get("collected"))
                .missing(result.get("missing"))
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/conversation-state/{userId}")
    public ResponseEntity<ApiResponse<Void>> clearConversationState(
            @PathVariable Integer userId) {

        chatbotService.clearConversationState(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Conversation state cleared"));
    }
}
