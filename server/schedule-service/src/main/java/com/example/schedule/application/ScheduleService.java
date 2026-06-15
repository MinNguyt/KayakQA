package com.example.schedule.application;

import com.example.schedule.domain.model.VehicleSchedule;
import com.example.schedule.domain.repository.VehicleScheduleRepository;
import com.example.schedule.infrastructure.exception.ResourceNotFoundException;
import com.example.schedule.presentation.dto.schedule.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService {

    private final VehicleScheduleRepository scheduleRepository;

    /**
     * Get schedules with filters and pagination
     */
    @Transactional(readOnly = true)
    public Page<ScheduleResponseDTO> getSchedules(ScheduleQueryDTO query) {
        log.info("Fetching schedules with page={}, limit={}, routeId={}, busId={}, status={}",
                query.getPage(), query.getLimit(), query.getRouteId(), query.getBusId(), query.getStatus());

        // Parse sort parameter (format: "id:asc" or "departureTime:desc")
        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        if (query.getSortBy() != null && !query.getSortBy().isEmpty()) {
            String[] sortParts = query.getSortBy().split(":");
            if (sortParts.length == 2) {
                Sort.Direction direction = sortParts[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;
                sort = Sort.by(direction, sortParts[0]);
            }
        }

        Pageable pageable = PageRequest.of(query.getPage() - 1, query.getLimit(), sort);

        Page<VehicleSchedule> page = scheduleRepository.findWithFilters(
                query.getRouteId(),
                query.getBusId(),
                query.getStatus(),
                pageable);

        return page.map(ScheduleResponseDTO::fromEntity);
    }

    /**
     * Get schedule by ID
     */
    @Transactional(readOnly = true)
    public ScheduleResponseDTO getScheduleById(Integer id) {
        log.info("Fetching schedule by id={}", id);
        VehicleSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        return ScheduleResponseDTO.fromEntity(schedule);
    }

    /**
     * Create a new schedule
     */
    @Transactional
    public ScheduleResponseDTO createSchedule(ScheduleCreateDTO dto) {
        log.info("Creating new schedule for routeId={}, busId={}", dto.getRouteId(), dto.getBusId());

        VehicleSchedule schedule = VehicleSchedule.builder()
                .routeId(dto.getRouteId())
                .busId(dto.getBusId())
                .departureTime(dto.getDepartureTime())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .status(VehicleSchedule.ScheduleStatus.AVAILABLE)
                .build();

        VehicleSchedule saved = scheduleRepository.save(schedule);
        log.info("Schedule created successfully with id={}", saved.getId());

        return ScheduleResponseDTO.fromEntity(saved);
    }

    /**
     * Update a schedule
     */
    @Transactional
    public ScheduleResponseDTO updateSchedule(Integer id, ScheduleUpdateDTO dto) {
        log.info("Updating schedule id={}", id);

        VehicleSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        if (dto.getRouteId() != null) {
            schedule.setRouteId(dto.getRouteId());
        }
        if (dto.getBusId() != null) {
            schedule.setBusId(dto.getBusId());
        }
        if (dto.getDepartureTime() != null) {
            schedule.setDepartureTime(dto.getDepartureTime());
        }
        if (dto.getArrivalTime() != null) {
            schedule.setArrivalTime(dto.getArrivalTime());
        }
        if (dto.getAvailableSeats() != null) {
            schedule.setAvailableSeats(dto.getAvailableSeats());
        }
        if (dto.getStatus() != null) {
            schedule.setStatus(dto.getStatus());
        }
        if (dto.getIsActive() != null) {
            schedule.setIsActive(dto.getIsActive());
        }

        VehicleSchedule updated = scheduleRepository.save(schedule);
        log.info("Schedule updated successfully id={}", id);

        return ScheduleResponseDTO.fromEntity(updated);
    }

    /**
     * Delete a schedule
     */
    @Transactional
    public void deleteSchedule(Integer id) {
        log.info("Deleting schedule id={}", id);

        VehicleSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        scheduleRepository.delete(schedule);
        log.info("Schedule deleted successfully id={}", id);
    }
}
