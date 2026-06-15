package com.example.fleet.presentation.dto.seat;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateSeatsRequestDTO {

    @NotEmpty(message = "Seat configuration is required")
    private List<SeatConfigDTO> seatConfig;
}
