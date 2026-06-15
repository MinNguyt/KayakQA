package com.example.identity.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.identity.domain.model.User;
import com.example.identity.domain.repository.UserRepository;
import com.example.identity.infrastructure.exception.ConflictException;
import com.example.identity.infrastructure.exception.InvalidCredentialsException;
import com.example.identity.infrastructure.exception.ResourceNotFoundException;
import com.example.identity.infrastructure.security.JwtTokenProvider;
import com.example.identity.presentation.dto.LoginRequest;
import com.example.identity.presentation.dto.LoginResponse;
import com.example.identity.presentation.dto.RegisterRequest;
import com.example.identity.presentation.dto.RegisterResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", request.getEmail());
                    return new ResourceNotFoundException("User not found with email: " + request.getEmail());
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - invalid password for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid password");
        }

        String token = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        log.info("Login successful for user: {} (id={})", user.getEmail(), user.getId());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public RegisterResponse register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new ConflictException("Email already exists: " + request.getEmail());
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed - username already exists: {}", request.getUsername());
            throw new ConflictException("Username already exists: " + request.getUsername());
        }
         String randomUUIDString = UUID.randomUUID().toString();

        User user = User.builder()
                .username(randomUUIDString)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .age(request.getAge())
                .role("user")
                .isActive(1)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        return RegisterResponse.builder()
                .message("User registered successfully")
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public User getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found by email: {}", email);
                    return new ResourceNotFoundException("User not found with email: " + email);
                });
    }

    public User getUserByUsername(String username) {
        log.debug("Fetching user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found by username: {}", username);
                    return new ResourceNotFoundException("User not found with username: " + username);
                });
    }
}
