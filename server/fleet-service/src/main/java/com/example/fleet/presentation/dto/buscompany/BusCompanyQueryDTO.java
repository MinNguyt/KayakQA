package com.example.fleet.presentation.dto.buscompany;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusCompanyQueryDTO {
    private int page = 1;
    private int limit = 10;
    private String search;
}
