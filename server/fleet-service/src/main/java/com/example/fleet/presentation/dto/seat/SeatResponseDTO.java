package com.example.fleet.presentation.dto.seat;

import com.example.fleet.domain.model.Seat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponseDTO {
    private Integer id;
    private Integer vehicleId;
    private String vehicleName;
    private String vehicleLicensePlate;
    private String seatNumber;
    private Seat.SeatType seatType;
    private Seat.SeatStatus status;
    private BigDecimal priceForTypeSeat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SeatResponseDTO fromEntity(Seat entity) {
        return SeatResponseDTO.builder()
                .id(entity.getId())
                .vehicleId(entity.getVehicleId())
                .seatNumber(entity.getSeatNumber())
                .seatType(entity.getSeatType())
                .status(entity.getStatus())
                .priceForTypeSeat(entity.getPriceForTypeSeat())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
