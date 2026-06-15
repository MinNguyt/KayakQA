package com.example.ticket.service.payment;

import com.example.ticket.application.PaymentService;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.PaymentRepository;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.infrastructure.messaging.PaymentEventProducer;
import com.example.ticket.presentation.dto.SePayWebhookDTO;
import com.example.ticket.presentation.dto.event.PaymentEvent;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ticket ID extraction logic in PaymentService.
 * Tests the private extractTicketId method indirectly through
 * processSePayWebhook.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService - extractTicketId Tests")
class ExtractTicketIdTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PaymentEventProducer paymentEventProducer;

    @InjectMocks
    private PaymentService paymentService;

    @Nested
    @DisplayName("Valid Ticket ID Extraction")
    class ValidExtraction {

        @ParameterizedTest(name = "Content: \"{0}\" should extract ticket ID: {1}")
        @CsvSource({
                "'DH1 FT123456', 1",
                "'DH5 Payment', 5",
                "'DH10 Reference', 10",
                "'DH100 Test', 100",
                "'DH999 Long ID', 999",
                "'DH12345 Very long ticket id', 12345"
        })
        @DisplayName("Should extract ticket ID from various valid DH patterns")
        void extractTicketId_Success_VariousPatterns(String content, int expectedTicketId) {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent(content);
            Ticket ticket = createTicketWithId(expectedTicketId);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(expectedTicketId)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(expectedTicketId);
            verify(paymentEventProducer).sendPaymentEvent(eventCaptor.capture());
            assertThat(eventCaptor.getValue().getTicketId()).isEqualTo(expectedTicketId);
        }

        @Test
        @DisplayName("Should extract ticket ID when DH is at the start with no space")
        void extractTicketId_Success_NoSpaceAfterNumber() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("DH42FT26036954350390");
            Ticket ticket = createTicketWithId(42);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(42)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(42);
        }

        @Test
        @DisplayName("Should handle content with leading whitespace")
        void extractTicketId_Success_WithLeadingWhitespace() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("  DH7 Payment");
            Ticket ticket = createTicketWithId(7);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(7)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(7);
        }
    }

    @Nested
    @DisplayName("Invalid Ticket ID Content")
    class InvalidExtraction {

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("Should not extract ticket ID from null or empty content")
        void extractTicketId_Failure_NullOrEmpty(String content) {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent(content);
            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository, never()).findById(anyInt());
        }

        @ParameterizedTest
        @ValueSource(strings = {
                "Payment without DH prefix",
                "dh5 lowercase prefix",
                "DHABC non-numeric",
                "D5 incomplete prefix",
                "H5 incomplete prefix",
                "5DH reversed order",
                " DH in middle of content",
                "Prefix DH5 not at start"
        })
        @DisplayName("Should not extract ticket ID from invalid patterns")
        void extractTicketId_Failure_InvalidPatterns(String content) {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent(content);
            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository, never()).findById(anyInt());
        }

        @Test
        @DisplayName("Should not extract when DH is followed by non-digits")
        void extractTicketId_Failure_DHFollowedByNonDigits() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("DH payment");
            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository, never()).findById(anyInt());
        }

        @Test
        @DisplayName("Should not extract when DH is in the middle of content")
        void extractTicketId_Failure_DHInMiddle() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("Payment DH5 for booking");
            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository, never()).findById(anyInt());
        }

        @Test
        @DisplayName("Should not extract when only whitespace before non-matching pattern")
        void extractTicketId_Failure_WhitespaceWithInvalidPattern() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("   Payment DH5");
            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository, never()).findById(anyInt());
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {

        @Test
        @DisplayName("Should handle ticket ID with leading zeros correctly")
        void extractTicketId_Success_LeadingZeros() {
            // Arrange - DH007 should be parsed as integer 7
            SePayWebhookDTO webhook = createWebhookWithContent("DH007 Agent ticket");
            Ticket ticket = createTicketWithId(7);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(7)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(7);
        }

        @Test
        @DisplayName("Should handle single digit ticket ID")
        void extractTicketId_Success_SingleDigit() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("DH1");
            Ticket ticket = createTicketWithId(1);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(1)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(1);
        }

        @Test
        @DisplayName("Should handle very large ticket ID")
        void extractTicketId_Success_LargeTicketId() {
            // Arrange
            int largeId = 999999999;
            SePayWebhookDTO webhook = createWebhookWithContent("DH999999999 Large ID");
            Ticket ticket = createTicketWithId(largeId);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(largeId)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(largeId);
        }

        @Test
        @DisplayName("Should handle content with special characters after ticket ID")
        void extractTicketId_Success_SpecialCharactersAfter() {
            // Arrange
            SePayWebhookDTO webhook = createWebhookWithContent("DH25@#$%^&*()!~");
            Ticket ticket = createTicketWithId(25);

            when(paymentRepository.findBySepayId(anyLong())).thenReturn(Optional.empty());
            when(ticketRepository.findById(25)).thenReturn(Optional.of(ticket));
            when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act
            paymentService.processSePayWebhook(webhook);

            // Assert
            verify(ticketRepository).findById(25);
        }
    }

    // Helper methods
    private SePayWebhookDTO createWebhookWithContent(String content) {
        return SePayWebhookDTO.builder()
                .id(12345L)
                .content(content)
                .transferAmount(new BigDecimal("150000"))
                .build();
    }

    private Ticket createTicketWithId(int id) {
        return Ticket.builder()
                .id(id)
                .userId(1)
                .scheduleId(100)
                .seatId(10)
                .totalPrice(new BigDecimal("150000"))
                .status(TicketStatus.PENDING)
                .build();
    }
}
