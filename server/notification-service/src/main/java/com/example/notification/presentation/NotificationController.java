package com.example.notification.presentation;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.notification.application.NotificationService;
import com.example.notification.domain.model.Email;
import com.example.notification.domain.model.EmailStatus;
import com.example.notification.presentation.dto.EmailCreateDTO;
import com.example.notification.presentation.dto.EmailResponseDTO;
import com.example.notification.presentation.dto.EmailUpdateDTO;
import com.example.notification.presentation.dto.PaginatedResponse;
import com.example.notification.presentation.dto.ApiResponse;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    private ApiResponse<Email> sendEmailController(@RequestBody EmailCreateDTO emailCreateDTO) {
        String recipient = emailCreateDTO.getRecipient();
        String body = emailCreateDTO.getBody();
        String subject = emailCreateDTO.getSubject();
        Email email = notificationService.sendEmailService(recipient, subject, body);
        return ApiResponse.success(email);
    }

    @GetMapping
    private ApiResponse<PaginatedResponse<Email>> getEmailController(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) EmailStatus status) {

        return ApiResponse.success(notificationService.getEmailService(page, limit, status));
    }

    @PutMapping("/{id}")
    private ApiResponse<Email> updateEmailController(
            @PathVariable Integer id,
            @RequestBody EmailUpdateDTO emailUpdateDTO) {
        Email email = notificationService.updateEmailService(id, emailUpdateDTO);
        return ApiResponse.success(email);
    }

    @DeleteMapping("/{id}")
    private ApiResponse<Void> deleteEmailController(@PathVariable Integer id) {
        notificationService.deleteEmailService(id);
        return ApiResponse.success(null);
    }

}
