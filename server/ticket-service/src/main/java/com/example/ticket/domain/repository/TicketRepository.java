package com.example.ticket.domain.repository;

import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findByUserId(Integer userId);

    List<Ticket> findByUserIdAndStatus(Integer userId, TicketStatus status);

    Optional<Ticket> findByScheduleIdAndSeatId(Integer scheduleId, Integer seatId);

    // For admin
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
}
