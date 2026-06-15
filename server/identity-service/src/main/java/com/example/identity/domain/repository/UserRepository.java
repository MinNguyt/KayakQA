package com.example.identity.domain.repository;

import com.example.identity.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
