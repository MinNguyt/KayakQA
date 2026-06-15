package com.example.schedule.presentation.dto.schedule;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateDTO {

    @NotNull(message = "Route ID is required")
    private Integer routeId;

    @NotNull(message = "Bus ID is required")
    private Integer busId;

    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;

    private Boolean isActive;
}
