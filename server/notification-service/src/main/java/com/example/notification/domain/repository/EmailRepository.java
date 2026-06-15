package com.example.notification.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.notification.domain.model.Email;
import com.example.notification.domain.model.EmailStatus;

@Repository
public interface EmailRepository extends JpaRepository<Email, Integer> {

    public Page<Email> findByStatus(EmailStatus status, Pageable pageable);
}
