package com.example.route.presentation.dto.station;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StationQueryDTO {
    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int limit = 10;

    private String search;
    private String sortBy;
    private String order;
}
