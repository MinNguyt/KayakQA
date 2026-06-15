package com.example.route.presentation.controller;

import com.example.route.application.RouteService;
import com.example.route.presentation.dto.ApiResponse;
import com.example.route.presentation.dto.PageResponse;
import com.example.route.presentation.dto.route.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
@Tag(name = "Routes", description = "Route management endpoints")
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    @Operation(summary = "Get all routes with pagination")
    public ResponseEntity<ApiResponse<PageResponse<RouteResponseDTO>>> getAllRoutes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer departure_station_id,
            @RequestParam(required = false) Integer arrival_station_id,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String order) {

        RouteQueryDTO query = RouteQueryDTO.builder()
                .page(page)
                .limit(limit)
                .departure_station_id(departure_station_id)
                .arrival_station_id(arrival_station_id)
                .sortBy(sortBy)
                .order(order)
                .build();

        return ResponseEntity.ok(ApiResponse.success(routeService.getAllRoutes(query)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get route by ID")
    public ResponseEntity<ApiResponse<RouteResponseDTO>> getRouteById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(routeService.getRouteById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new route")
    public ResponseEntity<ApiResponse<RouteResponseDTO>> createRoute(
            @ModelAttribute RouteCreateDTO request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(routeService.createRoute(request),
                        "Route created successfully"));
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    @Operation(summary = "Update a route")
    public ResponseEntity<ApiResponse<RouteResponseDTO>> updateRoute(
            @PathVariable Integer id,
            @RequestBody RouteUpdateDTO request) {

        return ResponseEntity.ok(ApiResponse.success(routeService.updateRoute(id, request),
                "Route updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a route")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Integer id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Route deleted successfully"));
    }
}
