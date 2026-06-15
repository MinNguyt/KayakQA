package com.example.route.presentation.controller;

import com.example.route.application.StationService;
import com.example.route.presentation.dto.ApiResponse;
import com.example.route.presentation.dto.PageResponse;
import com.example.route.presentation.dto.station.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/stations")
@RequiredArgsConstructor
@Tag(name = "Stations", description = "Station management endpoints")
public class StationController {

    private final StationService stationService;

    @GetMapping
    @Operation(summary = "Get all stations with pagination")
    public ResponseEntity<ApiResponse<PageResponse<StationResponseDTO>>> getAllStations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String order) {

        StationQueryDTO query = StationQueryDTO.builder()
                .page(page)
                .limit(limit)
                .search(search)
                .sortBy(sortBy)
                .order(order)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stationService.getAllStations(query)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get station by ID")
    public ResponseEntity<ApiResponse<StationResponseDTO>> getStationById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(stationService.getStationById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new station")
    public ResponseEntity<ApiResponse<StationResponseDTO>> createStation(
            @ModelAttribute StationCreateDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "wallpaper", required = false) MultipartFile wallpaper) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(stationService.createStation(request, image, wallpaper),
                        "Station created successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a station")
    public ResponseEntity<ApiResponse<StationResponseDTO>> updateStation(
            @PathVariable Integer id,
            @ModelAttribute StationUpdateDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "wallpaper", required = false) MultipartFile wallpaper) {

        return ResponseEntity.ok(ApiResponse.success(stationService.updateStation(id, request, image, wallpaper),
                "Station updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a station")
    public ResponseEntity<ApiResponse<Void>> deleteStation(@PathVariable Integer id) {
        stationService.deleteStation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Station deleted successfully"));
    }
}
