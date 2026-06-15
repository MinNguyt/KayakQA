package com.example.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.example.notification.application.NotificationService;
import com.example.notification.domain.model.Email;
import com.example.notification.domain.model.EmailStatus;
import com.example.notification.domain.repository.EmailRepository;
import com.example.notification.infrastructure.email.MailService;
import com.example.notification.presentation.dto.EmailUpdateDTO;
import com.example.notification.presentation.dto.PaginatedResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Tests")
public class NotificationServiceTest {

    @Mock
    private EmailRepository emailRepository;

    @Mock
    private MailService mailService;

    @InjectMocks
    private NotificationService notificationService;

    private String recipient;
    private String subject;
    private String body;
    private Email savedEmail;

    @BeforeEach
    void setUp() {
        recipient = "lobaoduy2017@gmail.com";
        subject = "test subject";
        body = "test body";
        savedEmail = Email.builder()
                .id(1)
                .recipient(recipient)
                .subject(subject)
                .body(body)
                .status(EmailStatus.PENDING)
                .build();
    }

    // =====================================================================
    // sendEmailService
    // =====================================================================
    @Nested
    @DisplayName("sendEmailService")
    class SendEmailServiceTests {

        @Test
        @DisplayName("Should send email and save with PENDING status")
        void sendEmail_success() {
            // Arrange
            doNothing().when(mailService).sendPlainText(recipient, subject, body);
            when(emailRepository.save(any(Email.class))).thenReturn(savedEmail);

            // Act
            Email result = notificationService.sendEmailService(recipient, subject, body);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1);
            assertThat(result.getRecipient()).isEqualTo(recipient);
            assertThat(result.getSubject()).isEqualTo(subject);
            assertThat(result.getBody()).isEqualTo(body);
            assertThat(result.getStatus()).isEqualTo(EmailStatus.PENDING);

            // Verify interactions
            verify(mailService).sendPlainText(recipient, subject, body);
            verify(emailRepository).save(any(Email.class));
        }

        @Test
        @DisplayName("Should save email with correct fields via ArgumentCaptor")
        void sendEmail_savesCorrectFields() {
            // Arrange
            doNothing().when(mailService).sendPlainText(recipient, subject, body);
            when(emailRepository.save(any(Email.class))).thenReturn(savedEmail);
            ArgumentCaptor<Email> emailCaptor = ArgumentCaptor.forClass(Email.class);

            // Act
            notificationService.sendEmailService(recipient, subject, body);

            // Assert — verify the exact Email object passed to save()
            verify(emailRepository).save(emailCaptor.capture());
            Email captured = emailCaptor.getValue();
            assertThat(captured.getRecipient()).isEqualTo(recipient);
            assertThat(captured.getSubject()).isEqualTo(subject);
            assertThat(captured.getBody()).isEqualTo(body);
            assertThat(captured.getStatus()).isEqualTo(EmailStatus.PENDING);
        }

        @Test
        @DisplayName("Should throw RuntimeException when mail sending fails")
        void sendEmail_mailServiceThrows() {
            // Arrange
            doThrow(new RuntimeException("SMTP error"))
                    .when(mailService).sendPlainText(recipient, subject, body);

            // Act & Assert
            assertThatThrownBy(() -> notificationService.sendEmailService(recipient, subject, body))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Send mail failed")
                    .hasMessageContaining(recipient);

            // Verify email is NOT saved when sending fails
            verify(emailRepository, never()).save(any(Email.class));
        }
    }

    // =====================================================================
    // getEmailService
    // =====================================================================
    @Nested
    @DisplayName("getEmailService")
    class GetEmailServiceTests {

        @Test
        @DisplayName("Should return paginated emails without status filter")
        void getEmails_noStatusFilter() {
            // Arrange
            List<Email> emails = List.of(savedEmail);
            Page<Email> page = new PageImpl<>(emails);
            when(emailRepository.findAll(any(PageRequest.class))).thenReturn(page);

            // Act
            PaginatedResponse<Email> result = notificationService.getEmailService(0, 10, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getResults()).hasSize(1);
            assertThat(result.getPage()).isEqualTo(0);
            assertThat(result.getLimit()).isEqualTo(10);

            // Verify findAll is called (not findByStatus)
            verify(emailRepository).findAll(any(PageRequest.class));
            verify(emailRepository, never()).findByStatus(any(), any());
        }

        @Test
        @DisplayName("Should return paginated emails with status filter")
        void getEmails_withStatusFilter() {
            // Arrange
            List<Email> emails = List.of(savedEmail);
            Page<Email> page = new PageImpl<>(emails);
            when(emailRepository.findByStatus(eq(EmailStatus.PENDING), any(PageRequest.class))).thenReturn(page);

            // Act
            PaginatedResponse<Email> result = notificationService.getEmailService(0, 10, EmailStatus.PENDING);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getResults()).hasSize(1);
            assertThat(result.getResults().get(0).getStatus()).isEqualTo(EmailStatus.PENDING);

            // Verify findByStatus is called (not findAll)
            verify(emailRepository).findByStatus(eq(EmailStatus.PENDING), any(PageRequest.class));
            verify(emailRepository, never()).findAll(any(PageRequest.class));
        }

        @Test
        @DisplayName("Should return empty results when no emails found")
        void getEmails_emptyResults() {
            // Arrange
            Page<Email> emptyPage = new PageImpl<>(List.of());
            when(emailRepository.findAll(any(PageRequest.class))).thenReturn(emptyPage);

            // Act
            PaginatedResponse<Email> result = notificationService.getEmailService(0, 10, null);

            // Assert
            assertThat(result.getResults()).isEmpty();
            assertThat(result.getPage()).isEqualTo(0);
            assertThat(result.getLimit()).isEqualTo(10);
        }
    }

    // =====================================================================
    // updateEmailService
    // =====================================================================
    @Nested
    @DisplayName("updateEmailService")
    class UpdateEmailServiceTests {

        @Test
        @DisplayName("Should update all fields when all are provided")
        void updateEmail_allFields() {
            // Arrange
            EmailUpdateDTO updateDTO = EmailUpdateDTO.builder()
                    .recipient("new@gmail.com")
                    .subject("new subject")
                    .body("new body")
                    .status("SENT")
                    .build();

            when(emailRepository.findById(1)).thenReturn(Optional.of(savedEmail));
            when(emailRepository.save(any(Email.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            Email result = notificationService.updateEmailService(1, updateDTO);

            // Assert
            assertThat(result.getRecipient()).isEqualTo("new@gmail.com");
            assertThat(result.getSubject()).isEqualTo("new subject");
            assertThat(result.getBody()).isEqualTo("new body");
            assertThat(result.getStatus()).isEqualTo(EmailStatus.SENT);

            verify(emailRepository).findById(1);
            verify(emailRepository).save(any(Email.class));
        }

        @Test
        @DisplayName("Should update only recipient when only recipient is provided")
        void updateEmail_partialUpdate_recipientOnly() {
            // Arrange
            EmailUpdateDTO updateDTO = EmailUpdateDTO.builder()
                    .recipient("updated@gmail.com")
                    .build();

            when(emailRepository.findById(1)).thenReturn(Optional.of(savedEmail));
            when(emailRepository.save(any(Email.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            Email result = notificationService.updateEmailService(1, updateDTO);

            // Assert — recipient changed, others remain unchanged
            assertThat(result.getRecipient()).isEqualTo("updated@gmail.com");
            assertThat(result.getSubject()).isEqualTo(subject);
            assertThat(result.getBody()).isEqualTo(body);
            assertThat(result.getStatus()).isEqualTo(EmailStatus.PENDING);
        }

        @Test
        @DisplayName("Should update only status when only status is provided")
        void updateEmail_partialUpdate_statusOnly() {
            // Arrange
            EmailUpdateDTO updateDTO = EmailUpdateDTO.builder()
                    .status("FAILED")
                    .build();

            when(emailRepository.findById(1)).thenReturn(Optional.of(savedEmail));
            when(emailRepository.save(any(Email.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            Email result = notificationService.updateEmailService(1, updateDTO);

            // Assert
            assertThat(result.getStatus()).isEqualTo(EmailStatus.FAILED);
            assertThat(result.getRecipient()).isEqualTo(recipient);
            assertThat(result.getSubject()).isEqualTo(subject);
            assertThat(result.getBody()).isEqualTo(body);
        }

        @Test
        @DisplayName("Should throw RuntimeException when email not found")
        void updateEmail_notFound() {
            // Arrange
            EmailUpdateDTO updateDTO = EmailUpdateDTO.builder().subject("new").build();
            when(emailRepository.findById(99)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> notificationService.updateEmailService(99, updateDTO))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Email not found with id: 99");

            verify(emailRepository, never()).save(any(Email.class));
        }

        @Test
        @DisplayName("Should throw IllegalArgumentException for invalid status string")
        void updateEmail_invalidStatus() {
            // Arrange
            EmailUpdateDTO updateDTO = EmailUpdateDTO.builder()
                    .status("INVALID_STATUS")
                    .build();

            when(emailRepository.findById(1)).thenReturn(Optional.of(savedEmail));

            // Act & Assert
            assertThatThrownBy(() -> notificationService.updateEmailService(1, updateDTO))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(emailRepository, never()).save(any(Email.class));
        }
    }

    // =====================================================================
    // deleteEmailService
    // =====================================================================
    @Nested
    @DisplayName("deleteEmailService")
    class DeleteEmailServiceTests {

        @Test
        @DisplayName("Should delete email when it exists")
        void deleteEmail_success() {
            // Arrange
            when(emailRepository.existsById(1)).thenReturn(true);
            doNothing().when(emailRepository).deleteById(1);

            // Act
            notificationService.deleteEmailService(1);

            // Assert
            verify(emailRepository).existsById(1);
            verify(emailRepository).deleteById(1);
        }

        @Test
        @DisplayName("Should throw RuntimeException when email not found")
        void deleteEmail_notFound() {
            // Arrange
            when(emailRepository.existsById(99)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> notificationService.deleteEmailService(99))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Email not found with id: 99");

            verify(emailRepository, never()).deleteById(any());
        }
    }
}
