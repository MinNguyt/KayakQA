package com.example.route.presentation.dto.route;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteQueryDTO {
    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int limit = 10;

    private Integer departure_station_id;
    private Integer arrival_station_id;
    private String sortBy;
    private String order;
}
