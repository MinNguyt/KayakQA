package com.example.schedule.presentation.controller;

import com.example.schedule.application.ScheduleService;
import com.example.schedule.presentation.dto.ApiResponse;
import com.example.schedule.presentation.dto.schedule.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/vehicle-schedules")
@RequiredArgsConstructor
@Tag(name = "Vehicle Schedules", description = "Vehicle schedule management endpoints")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    @Operation(summary = "Get all schedules with pagination and filters")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSchedules(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) Integer routeId,
            @RequestParam(required = false) Integer busId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "id:asc") String sortBy) {

        ScheduleQueryDTO query = ScheduleQueryDTO.builder()
                .page(page)
                .limit(limit)
                .routeId(routeId)
                .busId(busId)
                .sortBy(sortBy)
                .build();

        Page<ScheduleResponseDTO> schedulePage = scheduleService.getSchedules(query);

        Map<String, Object> result = new HashMap<>();
        result.put("results", schedulePage.getContent());
        result.put("total", schedulePage.getTotalElements());
        result.put("page", page);
        result.put("limit", limit);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get schedule by ID")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> getScheduleById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getScheduleById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new schedule")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> createSchedule(
            @Valid @RequestBody ScheduleCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.createSchedule(dto), "Schedule created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a schedule")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> updateSchedule(
            @PathVariable Integer id,
            @Valid @RequestBody ScheduleUpdateDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.updateSchedule(id, dto),
                "Schedule updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a schedule")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteSchedule(@PathVariable Integer id) {
        scheduleService.deleteSchedule(id);
        Map<String, Object> result = new HashMap<>();
        result.put("deleted", true);
        result.put("id", id);
        return ResponseEntity.ok(ApiResponse.success(result, "Schedule deleted successfully"));
    }
}
