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
import static org.mockito.Mockito.*;

/**
 * Unit tests for successful scenarios of
 * {@link PaymentService#processSePayWebhook(SePayWebhookDTO)}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService - processSePayWebhook Success Tests")
class ProcessSePayWebhookSuccessTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PaymentEventProducer paymentEventProducer;

    @InjectMocks
    private PaymentService paymentService;

    private SePayWebhookDTO validWebhookDTO;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        validWebhookDTO = SePayWebhookDTO.builder()
                .id(12345L)
                .gateway("VCB")
                .transactionDate("2026-02-06 14:30:00")
                .accountNumber("0123456789")
                .code("TXN001")
                .content("DH5 FT26036954350390")
                .transferType("in")
                .transferAmount(new BigDecimal("150000"))
                .accumulated(new BigDecimal("150000"))
                .subAccount("SUB001")
                .referenceCode("REF001")
                .description("Payment for ticket")
                .build();

        ticket = Ticket.builder()
                .id(5)
                .userId(1)
                .scheduleId(100)
                .seatId(10)
                .totalPrice(new BigDecimal("150000"))
                .status(TicketStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should process webhook successfully and save payment")
    void processSePayWebhook_Success_SavesPayment() {
        // Arrange
        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());
        when(ticketRepository.findById(5)).thenReturn(Optional.of(ticket));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(1);
            return payment;
        });

        // Act
        paymentService.processSePayWebhook(validWebhookDTO);

        // Assert
        verify(paymentRepository).save(any(Payment.class));
        verify(paymentEventProducer).sendPaymentEvent(any(PaymentEvent.class));
    }

    @Test
    @DisplayName("Should create payment with all fields from webhook DTO")
    void processSePayWebhook_Success_PaymentContainsAllFields() {
        // Arrange
        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());
        when(ticketRepository.findById(5)).thenReturn(Optional.of(ticket));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);

        // Act
        paymentService.processSePayWebhook(validWebhookDTO);

        // Assert
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();

        assertThat(savedPayment.getSepayId()).isEqualTo(12345L);
        assertThat(savedPayment.getGateway()).isEqualTo("VCB");
        assertThat(savedPayment.getAccountNumber()).isEqualTo("0123456789");
        assertThat(savedPayment.getCode()).isEqualTo("TXN001");
        assertThat(savedPayment.getContent()).isEqualTo("DH5 FT26036954350390");
        assertThat(savedPayment.getTransferType()).isEqualTo("in");
        assertThat(savedPayment.getTransferAmount()).isEqualByComparingTo(new BigDecimal("150000"));
        assertThat(savedPayment.getAccumulated()).isEqualByComparingTo(new BigDecimal("150000"));
        assertThat(savedPayment.getSubAccount()).isEqualTo("SUB001");
        assertThat(savedPayment.getReferenceCode()).isEqualTo("REF001");
        assertThat(savedPayment.getDescription()).isEqualTo("Payment for ticket");
        assertThat(savedPayment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(savedPayment.getTicket()).isEqualTo(ticket);
    }

    @Test
    @DisplayName("Should publish payment event to Kafka after saving payment")
    void processSePayWebhook_Success_PublishesPaymentEvent() {
        // Arrange
        when(paymentRepository.findBySepayId(12345L)).thenReturn(Optional.empty());
        when(ticketRepository.findById(5)).thenReturn(Optional.of(ticket));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(validWebhookDTO);

        // Assert
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        PaymentEvent sentEvent = eventCaptor.getValue();

        assertThat(sentEvent.getSepayId()).isEqualTo(12345L);
        assertThat(sentEvent.getTicketId()).isEqualTo(5);
        assertThat(sentEvent.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(sentEvent.getAmount()).isEqualByComparingTo(new BigDecimal("150000"));
        assertThat(sentEvent.getContent()).isEqualTo("DH5 FT26036954350390");
        assertThat(sentEvent.getDescription()).isEqualTo("Payment for ticket");
    }

    @Test
    @DisplayName("Should process webhook with different ticket IDs correctly")
    void processSePayWebhook_Success_WithDifferentTicketId() {
        // Arrange
        SePayWebhookDTO webhookWithTicket100 = SePayWebhookDTO.builder()
                .id(99999L)
                .content("DH100 Payment for booking")
                .transferAmount(new BigDecimal("200000"))
                .build();

        Ticket ticket100 = Ticket.builder()
                .id(100)
                .totalPrice(new BigDecimal("200000"))
                .status(TicketStatus.PENDING)
                .build();

        when(paymentRepository.findBySepayId(99999L)).thenReturn(Optional.empty());
        when(ticketRepository.findById(100)).thenReturn(Optional.of(ticket100));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

        // Act
        paymentService.processSePayWebhook(webhookWithTicket100);

        // Assert
        verify(ticketRepository).findById(100);
        verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getTicketId()).isEqualTo(100);
    }

    @Test
    @DisplayName("Should call services in correct order: findBySepayId -> extractTicketId -> findById -> save -> sendEvent")
    void processSePayWebhook_Success_CallsServicesInCorrectOrder() {
        // Arrange
        when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
        when(ticketRepository.findById(anyInt())).thenReturn(Optional.of(ticket));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        paymentService.processSePayWebhook(validWebhookDTO);

        // Assert
        var inOrder = inOrder(paymentRepository, ticketRepository, paymentEventProducer);
        inOrder.verify(paymentRepository).findBySepayId(12345L);
        inOrder.verify(ticketRepository).findById(5);
        inOrder.verify(paymentRepository).save(any(Payment.class));
        inOrder.verify(paymentEventProducer).sendPaymentEvent(any(PaymentEvent.class));
    }
}
