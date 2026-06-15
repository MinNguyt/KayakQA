package com.example.fleet.presentation.dto.vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUpdateDTO {
    private String name;
    private String licensePlate;
    private Integer capacity;
    private Integer company_id;
    private String markdownContent;
    private String markdownHtml;
}
