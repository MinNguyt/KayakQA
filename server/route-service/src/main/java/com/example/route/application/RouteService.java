package com.example.route.application;

import com.example.route.domain.model.Route;
import com.example.route.domain.model.Station;
import com.example.route.domain.repository.RouteRepository;
import com.example.route.domain.repository.StationRepository;
import com.example.route.infrastructure.exception.ResourceNotFoundException;
import com.example.route.presentation.dto.PageResponse;
import com.example.route.presentation.dto.route.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteService {

    private final RouteRepository routeRepository;
    private final StationRepository stationRepository;

    @Transactional(readOnly = true)
    public PageResponse<RouteResponseDTO> getAllRoutes(RouteQueryDTO query) {
        log.info("Fetching routes with page={}, limit={}, departureStationId={}, arrivalStationId={}",
                query.getPage(), query.getLimit(), query.getDeparture_station_id(), query.getArrival_station_id());

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (query.getSortBy() != null && !query.getSortBy().isEmpty()) {
            String sortField = query.getSortBy();
            if ("created_at".equals(sortField)) {
                sortField = "createdAt";
            }
            Sort.Direction direction = "asc".equalsIgnoreCase(query.getOrder())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            sort = Sort.by(direction, sortField);
        }

        Pageable pageable = PageRequest.of(query.getPage() - 1, query.getLimit(), sort);
        Page<Route> routes;

        if (query.getDeparture_station_id() != null || query.getArrival_station_id() != null) {
            routes = routeRepository.findAllWithFilters(pageable,
                    query.getDeparture_station_id(), query.getArrival_station_id());
        } else {
            routes = routeRepository.findAllWithStations(pageable);
        }

        List<RouteResponseDTO> routeDTOs = routes.getContent().stream()
                .map(RouteResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.<RouteResponseDTO>builder()
                .results(routeDTOs)
                .total((int) routes.getTotalElements())
                .page(query.getPage())
                .limit(query.getLimit())
                .totalPages(routes.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public RouteResponseDTO getRouteById(Integer id) {
        log.info("Fetching route by id={}", id);
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return RouteResponseDTO.fromEntity(route);
    }

    @Transactional
    public RouteResponseDTO createRoute(RouteCreateDTO request) {
        log.info("Creating new route: departure={}, arrival={}",
                request.getDeparture_station_id(), request.getArrival_station_id());

        Station departureStation = stationRepository.findById(request.getDeparture_station_id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departure station not found with id: " + request.getDeparture_station_id()));

        Station arrivalStation = stationRepository.findById(request.getArrival_station_id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Arrival station not found with id: " + request.getArrival_station_id()));

        Route route = Route.builder()
                .departureStation(departureStation)
                .arrivalStation(arrivalStation)
                .distanceKm(request.getDistance_km())
                .estimatedDurationHours(request.getEstimated_duration_hours())
                .isActive(1)
                .build();

        Route saved = routeRepository.save(route);
        log.info("Route created successfully with id={}", saved.getId());

        return RouteResponseDTO.fromEntity(saved);
    }

    @Transactional
    public RouteResponseDTO updateRoute(Integer id, RouteUpdateDTO request) {
        log.info("Updating route id={}", id);

        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        if (request.getDeparture_station_id() != null) {
            Station departureStation = stationRepository.findById(request.getDeparture_station_id())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Departure station not found with id: " + request.getDeparture_station_id()));
            route.setDepartureStation(departureStation);
        }

        if (request.getArrival_station_id() != null) {
            Station arrivalStation = stationRepository.findById(request.getArrival_station_id())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Arrival station not found with id: " + request.getArrival_station_id()));
            route.setArrivalStation(arrivalStation);
        }

        if (request.getDistance_km() != null) {
            route.setDistanceKm(request.getDistance_km());
        }

        if (request.getEstimated_duration_hours() != null) {
            route.setEstimatedDurationHours(request.getEstimated_duration_hours());
        }

        Route updated = routeRepository.save(route);
        log.info("Route updated successfully id={}", id);

        return RouteResponseDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteRoute(Integer id) {
        log.info("Deleting route id={}", id);

        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));

        routeRepository.delete(route);
        log.info("Route deleted successfully id={}", id);
    }
}
