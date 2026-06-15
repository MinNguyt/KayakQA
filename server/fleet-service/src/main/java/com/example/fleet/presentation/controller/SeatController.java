package com.example.fleet.presentation.controller;

import com.example.fleet.application.SeatService;
import com.example.fleet.presentation.dto.seat.*;
import com.example.fleet.presentation.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
@Tag(name = "Seats", description = "Seat management endpoints")
public class SeatController {

    private final SeatService seatService;

    @GetMapping
    @Operation(summary = "Get all seats")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> getAllSeats() {
        return ResponseEntity.ok(ApiResponse.success(seatService.getAllSeats()));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get seats by vehicle ID")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> getSeatsByVehicleId(@PathVariable Integer vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(seatService.getSeatsByVehicleId(vehicleId)));
    }

    @GetMapping("/vehicle/{vehicleId}/available")
    @Operation(summary = "Get available seats by vehicle ID")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> getAvailableSeatsByVehicleId(
            @PathVariable Integer vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(seatService.getAvailableSeatsByVehicleId(vehicleId)));
    }

    @PostMapping("/vehicle/{vehicleId}/generate")
    @Operation(summary = "Generate seats for a vehicle")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> generateSeatsForVehicle(
            @PathVariable Integer vehicleId,
            @Valid @RequestBody GenerateSeatsRequestDTO request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(seatService.generateSeatsForVehicle(vehicleId, request),
                        "Seats generated successfully"));
    }

    @PatchMapping("/{seatId}/status")
    @Operation(summary = "Update seat status")
    public ResponseEntity<ApiResponse<SeatResponseDTO>> updateSeatStatus(
            @PathVariable Integer seatId,
            @Valid @RequestBody SeatStatusUpdateDTO request) {

        return ResponseEntity.ok(ApiResponse.success(seatService.updateSeatStatus(seatId, request.getStatus()),
                "Seat status updated successfully"));
    }

    @DeleteMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Delete all seats for a vehicle")
    public ResponseEntity<Void> deleteSeatsByVehicleId(@PathVariable Integer vehicleId) {
        seatService.deleteSeatsByVehicleId(vehicleId);
        return ResponseEntity.noContent().build();
    }
}
