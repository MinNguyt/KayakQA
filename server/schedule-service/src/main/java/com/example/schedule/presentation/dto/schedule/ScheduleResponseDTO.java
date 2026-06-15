package com.example.schedule.presentation.dto.schedule;

import com.example.schedule.domain.model.VehicleSchedule;
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
public class ScheduleResponseDTO {

    private Integer id;
    private Integer routeId;
    private Integer busId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Integer availableSeats;
    private Integer totalSeats;
    private ScheduleStatus status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ScheduleResponseDTO fromEntity(VehicleSchedule schedule) {
        return ScheduleResponseDTO.builder()
                .id(schedule.getId())
                .routeId(schedule.getRouteId())
                .busId(schedule.getBusId())
                .departureTime(schedule.getDepartureTime())
                .arrivalTime(schedule.getArrivalTime())
                .availableSeats(schedule.getAvailableSeats())
                .totalSeats(schedule.getTotalSeats())
                .status(schedule.getStatus())
                .isActive(schedule.getIsActive())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}
