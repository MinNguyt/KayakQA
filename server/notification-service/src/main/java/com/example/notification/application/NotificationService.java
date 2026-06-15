package com.example.notification.application;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.notification.domain.model.Email;
import com.example.notification.domain.model.EmailStatus;
import com.example.notification.domain.repository.EmailRepository;
import com.example.notification.infrastructure.email.MailService;
import com.example.notification.presentation.dto.EmailResponseDTO;
import com.example.notification.presentation.dto.EmailUpdateDTO;
import com.example.notification.presentation.dto.PaginatedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final MailService mailService;
    private final EmailRepository emailRepository;

    public Email sendEmailService(String recipient, String subject, String body) {
        try {
            mailService.sendPlainText(recipient, subject, body);
        } catch (Exception e) {
            throw new RuntimeException("Send mail failed: unable send email to " + recipient);
        }
        Email email = Email.builder().recipient(recipient).subject(subject).body(body).status(EmailStatus.PENDING)
                .build();
        return emailRepository.save(email);
    }

    public PaginatedResponse<Email> getEmailService(int page, int limit, EmailStatus status) {
        PageRequest pageRequest = PageRequest.of(page, limit);
        Page emails;
        if (status != null) {
            emails = emailRepository.findByStatus(status, pageRequest);
        } else {
            emails = emailRepository.findAll(pageRequest);
        }
        return PaginatedResponse.builder().results(emails.getContent()).limit(limit).page(page).build();
    }

    public Email updateEmailService(Integer id, EmailUpdateDTO emailUpdateDTO) {
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Email not found with id: " + id));

        if (emailUpdateDTO.getRecipient() != null) {
            email.setRecipient(emailUpdateDTO.getRecipient());
        }
        if (emailUpdateDTO.getSubject() != null) {
            email.setSubject(emailUpdateDTO.getSubject());
        }
        if (emailUpdateDTO.getBody() != null) {
            email.setBody(emailUpdateDTO.getBody());
        }
        if (emailUpdateDTO.getStatus() != null) {
            email.setStatus(EmailStatus.valueOf(emailUpdateDTO.getStatus()));
        }

        return emailRepository.save(email);
    }

    public void deleteEmailService(Integer id) {
        if (!emailRepository.existsById(id)) {
            throw new RuntimeException("Email not found with id: " + id);
        }
        emailRepository.deleteById(id);
    }

}
