package com.example.ticket.service.payment;

import com.example.ticket.application.PaymentService;
import com.example.ticket.domain.model.Payment;
import com.example.ticket.domain.model.PaymentStatus;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.repository.PaymentRepository;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.infrastructure.messaging.PaymentEventProducer;
import com.example.ticket.presentation.dto.SePayWebhookDTO;
import com.example.ticket.presentation.dto.event.PaymentEvent;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for failure scenarios of
 * {@link PaymentService#processSePayWebhook(SePayWebhookDTO)}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService - processSePayWebhook Failure Tests")
class ProcessSePayWebhookFailureTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PaymentEventProducer paymentEventProducer;

    @InjectMocks
    private PaymentService paymentService;

    private SePayWebhookDTO validWebhookDTO;
    private Payment existingPayment;

    @BeforeEach
    void setUp() {
        validWebhookDTO = SePayWebhookDTO.builder()
                .id(12345L)
                .gateway("VCB")
                .content("DH5 FT26036954350390")
                .transferAmount(new BigDecimal("150000"))
                .description("Payment for ticket")
                .build();

        existingPayment = Payment.builder()
                .id(1)
                .sepayId(12345L)
                .status(PaymentStatus.COMPLETED)
                .build();
    }

    @Test
    @DisplayName("Should skip processing when payment already exists for SePay ID")
    void processSePayWebhook_Skip_WhenPaymentAlreadyExists() {
        // Arrange
        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.of(existingPayment));

        // Act
        paymentService.processSePayWebhook(validWebhookDTO);

        // Assert - No further operations should be performed
        verify(paymentRepository).findBySepayId(12345L);
        verify(ticketRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(paymentEventProducer, never()).sendPaymentEvent(any(PaymentEvent.class));
    }

    @Test
    @DisplayName("Should throw exception when ticket not found")
    void processSePayWebhook_Failure_WhenTicketNotFound() {
        // Arrange
        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());
        when(ticketRepository.findById(5)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> paymentService.processSePayWebhook(validWebhookDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Ticket not found");

        // Verify no save or event publishing occurred
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(paymentEventProducer, never()).sendPaymentEvent(any(PaymentEvent.class));
    }

    @Test
    @DisplayName("Should skip processing when content is null")
    void processSePayWebhook_Skip_WhenContentIsNull() {
        // Arrange
        SePayWebhookDTO webhookWithNullContent = SePayWebhookDTO.builder()
                .id(12345L)
                .content(null)
                .transferAmount(new BigDecimal("150000"))
                .build();

        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());

        // Act
        paymentService.processSePayWebhook(webhookWithNullContent);

        // Assert - No database or Kafka operations
        verify(ticketRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(paymentEventProducer, never()).sendPaymentEvent(any(PaymentEvent.class));
    }

    @Test
    @DisplayName("Should skip processing when content is empty")
    void processSePayWebhook_Skip_WhenContentIsEmpty() {
        // Arrange
        SePayWebhookDTO webhookWithEmptyContent = SePayWebhookDTO.builder()
                .id(12345L)
                .content("")
                .transferAmount(new BigDecimal("150000"))
                .build();

        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());

        // Act
        paymentService.processSePayWebhook(webhookWithEmptyContent);

        // Assert
        verify(ticketRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(paymentEventProducer, never()).sendPaymentEvent(any(PaymentEvent.class));
    }

    @Test
    @DisplayName("Should skip processing when content does not contain valid ticket ID pattern")
    void processSePayWebhook_Skip_WhenContentHasInvalidPattern() {
        // Arrange
        SePayWebhookDTO webhookWithInvalidPattern = SePayWebhookDTO.builder()
                .id(12345L)
                .content("Invalid payment content without ticket ID")
                .transferAmount(new BigDecimal("150000"))
                .build();

        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());

        // Act
        paymentService.processSePayWebhook(webhookWithInvalidPattern);

        // Assert
        verify(ticketRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(paymentEventProducer, never()).sendPaymentEvent(any(PaymentEvent.class));
    }

    @Test
    @DisplayName("Should skip processing when content has DH without number")
    void processSePayWebhook_Skip_WhenContentHasDHWithoutNumber() {
        // Arrange
        SePayWebhookDTO webhookWithDHNoNumber = SePayWebhookDTO.builder()
                .id(12345L)
                .content("DH payment for booking")
                .transferAmount(new BigDecimal("150000"))
                .build();

        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());

        // Act
        paymentService.processSePayWebhook(webhookWithDHNoNumber);

        // Assert
        verify(ticketRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should not process duplicate SePay IDs even with different content")
    void processSePayWebhook_Skip_DuplicateSepayId() {
        // Arrange - Same SePay ID, different content
        SePayWebhookDTO duplicateWebhook = SePayWebhookDTO.builder()
                .id(12345L) // Same ID as existingPayment
                .content("DH999 Different content")
                .transferAmount(new BigDecimal("999999"))
                .build();

        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.of(existingPayment));

        // Act
        paymentService.processSePayWebhook(duplicateWebhook);

        // Assert - Should skip even though content is different
        verify(ticketRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
