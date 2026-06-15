package com.example.ticket.service.payment;

import com.example.ticket.application.PaymentService;
import com.example.ticket.domain.model.Payment;
import com.example.ticket.domain.model.PaymentStatus;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.PaymentRepository;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.infrastructure.messaging.PaymentEventProducer;
import com.example.ticket.presentation.dto.SePayWebhookDTO;
import com.example.ticket.presentation.dto.event.PaymentEvent;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for payment amount validation in PaymentService.
 * Tests how the service handles different payment amounts relative to ticket
 * prices.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService - Payment Amount Validation Tests")
class PaymentAmountValidationTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PaymentEventProducer paymentEventProducer;

    @InjectMocks
    private PaymentService paymentService;

    private SePayWebhookDTO webhookDTO;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        webhookDTO = SePayWebhookDTO.builder()
                .id(12345L)
                .content("DH5 Payment")
                .transferAmount(new BigDecimal("150000"))
                .build();

        ticket = Ticket.builder()
                .id(5)
                .userId(1)
                .totalPrice(new BigDecimal("150000"))
                .status(TicketStatus.PENDING)
                .build();

        when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
        when(ticketRepository.findById(5)).thenReturn(Optional.of(ticket));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("Should set COMPLETED status when payment amount matches ticket price")
    void processSePayWebhook_CompletedStatus_WhenAmountMatches() {
        // Arrange
        webhookDTO.setTransferAmount(new BigDecimal("150000"));
        ticket.setTotalPrice(new BigDecimal("150000"));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should set COMPLETED status when payment amount exceeds ticket price")
    void processSePayWebhook_CompletedStatus_WhenAmountExceeds() {
        // Arrange
        webhookDTO.setTransferAmount(new BigDecimal("200000")); // More than ticket price
        ticket.setTotalPrice(new BigDecimal("150000"));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should still publish COMPLETED status when payment is less than ticket price (current behavior)")
    void processSePayWebhook_Status_WhenAmountLessThanTicketPrice() {
        // Arrange - Payment less than ticket price
        webhookDTO.setTransferAmount(new BigDecimal("100000"));
        ticket.setTotalPrice(new BigDecimal("150000"));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert - Current implementation logs warning but still sends COMPLETED
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        // Note: Current implementation always sends COMPLETED status
        assertThat(eventCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should include correct transfer amount in payment event")
    void processSePayWebhook_IncludesCorrectAmount() {
        // Arrange
        BigDecimal expectedAmount = new BigDecimal("175500.50");
        webhookDTO.setTransferAmount(expectedAmount);

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getAmount()).isEqualByComparingTo(expectedAmount);
    }

    @Test
    @DisplayName("Should save payment with correct transfer amount")
    void processSePayWebhook_SavesCorrectTransferAmount() {
        // Arrange
        BigDecimal expectedAmount = new BigDecimal("250000");
        webhookDTO.setTransferAmount(expectedAmount);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getTransferAmount()).isEqualByComparingTo(expectedAmount);
    }

    @Test
    @DisplayName("Should handle zero transfer amount")
    void processSePayWebhook_HandlesZeroAmount() {
        // Arrange
        webhookDTO.setTransferAmount(BigDecimal.ZERO);

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should handle large transfer amount")
    void processSePayWebhook_HandlesLargeAmount() {
        // Arrange
        BigDecimal largeAmount = new BigDecimal("99999999999.99");
        webhookDTO.setTransferAmount(largeAmount);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getTransferAmount()).isEqualByComparingTo(largeAmount);
    }

    @Test
    @DisplayName("Should save accumulated amount correctly")
    void processSePayWebhook_SavesAccumulatedAmount() {
        // Arrange
        BigDecimal accumulated = new BigDecimal("500000");
        webhookDTO.setAccumulated(accumulated);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);

        // Act
        paymentService.processSePayWebhook(webhookDTO);

        // Assert
        verify(paymentRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getAccumulated()).isEqualByComparingTo(accumulated);
    }
}
