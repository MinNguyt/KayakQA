package com.example.route.presentation.dto.route;

import com.example.route.domain.model.Route;
import com.example.route.presentation.dto.station.StationResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponseDTO {
        private Integer id;
        private StationResponseDTO departureStation;
        private StationResponseDTO arrivalStation;
        private String distance_km;
        private String estimated_duration_hours;
        private Integer isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static RouteResponseDTO fromEntity(Route route) {
                return RouteResponseDTO.builder()
                                .id(route.getId())
                                .departureStation(route.getDepartureStation() != null
                                                ? StationResponseDTO.fromEntity(route.getDepartureStation())
                                                : null)
                                .arrivalStation(route.getArrivalStation() != null
                                                ? StationResponseDTO.fromEntity(route.getArrivalStation())
                                                : null)
                                .distance_km(route.getDistanceKm())
                                .estimated_duration_hours(route.getEstimatedDurationHours())
                                .isActive(route.getIsActive())
                                .createdAt(route.getCreatedAt())
                                .updatedAt(route.getUpdatedAt())
                                .build();
        }
}
