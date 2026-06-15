package com.example.fleet.presentation.dto.seat;

import com.example.fleet.domain.model.Seat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private Seat.SeatStatus status;
}
