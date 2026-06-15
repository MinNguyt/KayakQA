package com.example.fleet.presentation.dto.vehicle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCreateDTO {

    @NotBlank(message = "Vehicle name is required")
    private String name;

    private String licensePlate;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    @NotNull(message = "Company ID is required")
    private Integer company_id;

    private String markdownContent;
    private String markdownHtml;
}
