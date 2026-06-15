package com.example.schedule.presentation.dto.schedule;

import com.example.schedule.domain.model.VehicleSchedule.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleUpdateDTO {

    private Integer routeId;
    private Integer busId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Integer availableSeats;
    private ScheduleStatus status;
    private Boolean isActive;
}
