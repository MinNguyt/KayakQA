package com.example.ticket.service;

import com.example.ticket.application.TicketService;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.infrastructure.messaging.NotificationProducer;
import com.example.ticket.infrastructure.messaging.TicketEventProducer;
import com.example.ticket.infrastructure.service.RedisLockService;
import com.example.ticket.presentation.dto.TicketCreateDTO;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link TicketService#createTicket(TicketCreateDTO, Integer)}
 * method.
 * 
 * Tests cover:
 * - Successful ticket creation with proper lock acquisition
 * - Lock acquisition failure scenarios
 * - Seat already booked scenarios
 * - Database save failure with lock release
 * - Ticket not found scenarios
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TicketService - createTicket Tests")
class TicketServiceCreateTicketTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private RedisLockService redisLockService;

    @Mock
    private NotificationProducer notificationProducer;

    @Mock
    private TicketEventProducer ticketEventProducer;

    @InjectMocks
    private TicketService ticketService;

    // Test data
    private TicketCreateDTO validTicketDTO;
    private Integer userId;
    private Ticket pendingTicket;
    private Ticket bookedTicket;

    @BeforeEach
    void setUp() {
        userId = 1;

        validTicketDTO = TicketCreateDTO.builder()
                .schedule_id(100)
                .seat_id(10)
                .price(new BigDecimal("150000"))
                .build();

        pendingTicket = Ticket.builder()
                .id(1)
                .userId(userId)
                .scheduleId(100)
                .seatId(10)
                .totalPrice(new BigDecimal("150000"))
                .status(TicketStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        bookedTicket = Ticket.builder()
                .id(2)
                .userId(2)
                .scheduleId(100)
                .seatId(10)
                .totalPrice(new BigDecimal("150000"))
                .status(TicketStatus.BOOKED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Successful Ticket Creation")
    class SuccessfulCreation {

        @Test
        @DisplayName("Should create ticket successfully when lock acquired and seat is available")
        void createTicket_Success_WhenLockAcquiredAndSeatAvailable() {
            // Arrange
            when(redisLockService.tryLock(eq(100), eq(10), eq(5L))).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
                Ticket ticket = invocation.getArgument(0);
                ticket.setId(1);
                return ticket;
            });

            // Act
            Ticket result = ticketService.createTicket(validTicketDTO, userId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(userId);
            assertThat(result.getScheduleId()).isEqualTo(100);
            assertThat(result.getSeatId()).isEqualTo(10);
            assertThat(result.getTotalPrice()).isEqualByComparingTo(new BigDecimal("150000"));
            assertThat(result.getStatus()).isEqualTo(TicketStatus.PENDING);

            // Verify interactions
            verify(redisLockService).tryLock(100, 10, 5L);
            verify(ticketRepository).findByScheduleIdAndSeatId(100, 10);
            verify(ticketRepository).save(any(Ticket.class));
            verify(redisLockService, never()).releaseLock(anyInt(), anyInt());
        }

        @Test
        @DisplayName("Should create ticket with correct price from DTO")
        void createTicket_Success_WithCorrectPriceFromDTO() {
            // Arrange
            BigDecimal expectedPrice = new BigDecimal("250000.50");
            TicketCreateDTO dtoWithCustomPrice = TicketCreateDTO.builder()
                    .schedule_id(100)
                    .seat_id(10)
                    .price(expectedPrice)
                    .build();

            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            Ticket result = ticketService.createTicket(dtoWithCustomPrice, userId);

            // Assert
            assertThat(result.getTotalPrice()).isEqualByComparingTo(expectedPrice);
        }

        @Test
        @DisplayName("Should capture and save ticket with all required fields")
        void createTicket_Success_SavesTicketWithAllFields() {
            // Arrange
            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);

            // Act
            ticketService.createTicket(validTicketDTO, userId);

            // Assert
            verify(ticketRepository).save(ticketCaptor.capture());
            Ticket savedTicket = ticketCaptor.getValue();

            assertThat(savedTicket.getUserId()).isEqualTo(userId);
            assertThat(savedTicket.getScheduleId()).isEqualTo(validTicketDTO.getSchedule_id());
            assertThat(savedTicket.getSeatId()).isEqualTo(validTicketDTO.getSeat_id());
            assertThat(savedTicket.getTotalPrice()).isEqualByComparingTo(validTicketDTO.getPrice());
            assertThat(savedTicket.getStatus()).isEqualTo(TicketStatus.PENDING);
            assertThat(savedTicket.getCreatedAt()).isNotNull();
            assertThat(savedTicket.getUpdatedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Lock Acquisition Failure")
    class LockAcquisitionFailure {

        @Test
        @DisplayName("Should throw exception when lock cannot be acquired")
        void createTicket_Failure_WhenLockNotAcquired() {
            // Arrange
            when(redisLockService.tryLock(100, 10, 5L)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> ticketService.createTicket(validTicketDTO, userId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Seat is currently locked by another user");

            // Verify no DB operations were performed
            verify(ticketRepository, never()).findByScheduleIdAndSeatId(anyInt(), anyInt());
            verify(ticketRepository, never()).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Should not release lock when lock was never acquired")
        void createTicket_Failure_DoesNotReleaseLockWhenNotAcquired() {
            // Arrange
            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(false);

            // Act
            try {
                ticketService.createTicket(validTicketDTO, userId);
            } catch (RuntimeException ignored) {
                // Expected exception
            }

            // Assert
            verify(redisLockService, never()).releaseLock(anyInt(), anyInt());
        }
    }

    @Nested
    @DisplayName("Seat Already Booked")
    class SeatAlreadyBooked {

        @Test
        @DisplayName("Should throw exception and release lock when seat is already booked")
        void createTicket_Failure_WhenSeatAlreadyBooked() {
            // Arrange
            when(redisLockService.tryLock(100, 10, 5L)).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(bookedTicket));

            // Act & Assert
            assertThatThrownBy(() -> ticketService.createTicket(validTicketDTO, userId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Seat already booked");

            // Verify lock was released
            verify(redisLockService).releaseLock(100, 10);
            verify(ticketRepository, never()).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Should release lock for correct schedule and seat when seat is booked")
        void createTicket_Failure_ReleasesCorrectLock() {
            // Arrange
            Integer scheduleId = 200;
            Integer seatId = 25;
            TicketCreateDTO dto = TicketCreateDTO.builder()
                    .schedule_id(scheduleId)
                    .seat_id(seatId)
                    .price(new BigDecimal("100000"))
                    .build();

            Ticket alreadyBookedTicket = Ticket.builder()
                    .status(TicketStatus.BOOKED)
                    .build();

            when(redisLockService.tryLock(scheduleId, seatId, 5L)).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(scheduleId, seatId))
                    .thenReturn(Optional.of(alreadyBookedTicket));

            // Act
            try {
                ticketService.createTicket(dto, userId);
            } catch (RuntimeException ignored) {
                // Expected exception
            }

            // Assert
            verify(redisLockService).releaseLock(scheduleId, seatId);
        }
    }

    @Nested
    @DisplayName("Ticket Not Found")
    class TicketNotFound {

        @Test
        @DisplayName("Should throw ResourceNotFoundException when no ticket exists for schedule/seat combination")
        void createTicket_Failure_WhenTicketNotFound() {
            // Arrange
            when(redisLockService.tryLock(100, 10, 5L)).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> ticketService.createTicket(validTicketDTO, userId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("not found ticket with seat id");

            // Verify no save operation was performed
            verify(ticketRepository, never()).save(any(Ticket.class));
        }
    }

    @Nested
    @DisplayName("Database Save Failure")
    class DatabaseSaveFailure {

        @Test
        @DisplayName("Should release lock when database save fails")
        void createTicket_Failure_ReleasesLockOnDatabaseError() {
            // Arrange
            when(redisLockService.tryLock(100, 10, 5L)).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class)))
                    .thenThrow(new RuntimeException("Database connection failed"));

            // Act & Assert
            assertThatThrownBy(() -> ticketService.createTicket(validTicketDTO, userId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Database connection failed");

            // Verify lock was released
            verify(redisLockService).releaseLock(100, 10);
        }

        @Test
        @DisplayName("Should rethrow original exception after releasing lock")
        void createTicket_Failure_RethrowsOriginalException() {
            // Arrange
            RuntimeException originalException = new RuntimeException("Unique constraint violation");

            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(anyInt(), anyInt()))
                    .thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenThrow(originalException);

            // Act & Assert
            assertThatThrownBy(() -> ticketService.createTicket(validTicketDTO, userId))
                    .isEqualTo(originalException);
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {

        @Test
        @DisplayName("Should handle ticket with CANCELLED status - allow rebooking")
        void createTicket_Success_WhenExistingTicketIsCancelled() {
            // Arrange
            Ticket cancelledTicket = Ticket.builder()
                    .id(3)
                    .userId(2)
                    .scheduleId(100)
                    .seatId(10)
                    .status(TicketStatus.CANCELLED)
                    .build();

            when(redisLockService.tryLock(100, 10, 5L)).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(cancelledTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
                Ticket ticket = invocation.getArgument(0);
                ticket.setId(4);
                return ticket;
            });

            // Act
            Ticket result = ticketService.createTicket(validTicketDTO, userId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(TicketStatus.PENDING);
            verify(ticketRepository).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Should handle ticket with PENDING status - allow claiming")
        void createTicket_Success_WhenExistingTicketIsPending() {
            // Arrange
            when(redisLockService.tryLock(100, 10, 5L)).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            Ticket result = ticketService.createTicket(validTicketDTO, userId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo(TicketStatus.PENDING);
        }

        @Test
        @DisplayName("Should handle zero price")
        void createTicket_Success_WithZeroPrice() {
            // Arrange
            TicketCreateDTO dtoWithZeroPrice = TicketCreateDTO.builder()
                    .schedule_id(100)
                    .seat_id(10)
                    .price(BigDecimal.ZERO)
                    .build();

            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            Ticket result = ticketService.createTicket(dtoWithZeroPrice, userId);

            // Assert
            assertThat(result.getTotalPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle large price values")
        void createTicket_Success_WithLargePrice() {
            // Arrange
            BigDecimal largePrice = new BigDecimal("9999999999.99");
            TicketCreateDTO dtoWithLargePrice = TicketCreateDTO.builder()
                    .schedule_id(100)
                    .seat_id(10)
                    .price(largePrice)
                    .build();

            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(100, 10)).thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            Ticket result = ticketService.createTicket(dtoWithLargePrice, userId);

            // Assert
            assertThat(result.getTotalPrice()).isEqualByComparingTo(largePrice);
        }
    }

    @Nested
    @DisplayName("Method Interaction Order")
    class MethodInteractionOrder {

        @Test
        @DisplayName("Should call services in correct order: lock -> find -> save")
        void createTicket_Success_CallsServicesInCorrectOrder() {
            // Arrange
            when(redisLockService.tryLock(anyInt(), anyInt(), anyLong())).thenReturn(true);
            when(ticketRepository.findByScheduleIdAndSeatId(anyInt(), anyInt()))
                    .thenReturn(Optional.of(pendingTicket));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            ticketService.createTicket(validTicketDTO, userId);

            // Assert - verify order of invocations
            var inOrder = inOrder(redisLockService, ticketRepository);
            inOrder.verify(redisLockService).tryLock(100, 10, 5L);
            inOrder.verify(ticketRepository).findByScheduleIdAndSeatId(100, 10);
            inOrder.verify(ticketRepository).save(any(Ticket.class));
        }
    }
}
