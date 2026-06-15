package com.example.fleet.presentation.dto.seat;

import com.example.fleet.domain.model.Seat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatConfigDTO {
    private Seat.SeatType seatType;
    private int quantity;
    private BigDecimal price;
}
