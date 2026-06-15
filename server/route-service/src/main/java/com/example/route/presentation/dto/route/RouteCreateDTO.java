package com.example.route.presentation.dto.route;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteCreateDTO {
    private Integer departure_station_id;
    private Integer arrival_station_id;
    private String distance_km;
    private String estimated_duration_hours;
}
