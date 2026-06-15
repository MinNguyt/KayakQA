package com.example.fleet.presentation.dto.vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleQueryDTO {
    private int page = 1;
    private int limit = 10;
    private String search;
    private Integer company_id;
}
