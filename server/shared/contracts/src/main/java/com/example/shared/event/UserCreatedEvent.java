package com.example.shared.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event published when a user is created.
 * Can be used for service communication via message broker in the future.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedEvent {
    private Integer userId;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
