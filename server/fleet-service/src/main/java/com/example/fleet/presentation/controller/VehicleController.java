package com.example.fleet.presentation.controller;

import com.example.fleet.application.VehicleService;
import com.example.fleet.presentation.dto.vehicle.*;
import com.example.fleet.presentation.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Vehicle management endpoints")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Get all vehicles with pagination")
    public ResponseEntity<ApiResponse<Page<VehicleResponseDTO>>> getAllVehicles(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer companyId) {

        VehicleQueryDTO query = VehicleQueryDTO.builder()
                .page(page)
                .limit(limit)
                .search(search)
                .company_id(companyId)
                .build();

        return ResponseEntity.ok(ApiResponse.success(vehicleService.getAllVehicles(query)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID")
    public ResponseEntity<ApiResponse<VehicleResponseDTO>> getVehicleById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new vehicle")
    public ResponseEntity<ApiResponse<VehicleResponseDTO>> createVehicle(
            @Valid @ModelAttribute VehicleCreateDTO request,
            @RequestPart(value = "featuredImage", required = false) MultipartFile featuredImage) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(vehicleService.createVehicle(request, featuredImage),
                        "Vehicle created successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a vehicle")
    public ResponseEntity<ApiResponse<VehicleResponseDTO>> updateVehicle(
            @PathVariable Integer id,
            @Valid @ModelAttribute VehicleUpdateDTO request,
            @RequestPart(value = "featuredImage", required = false) MultipartFile featuredImage) {

        return ResponseEntity.ok(ApiResponse.success(vehicleService.updateVehicle(id, request, featuredImage),
                "Vehicle updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a vehicle")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
