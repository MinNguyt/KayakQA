package com.example.ticket.domain.repository;

import com.example.ticket.domain.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByTicketId(Integer ticketId);

    Optional<Payment> findBySepayId(Long sepayId);
}
