package com.example.fleet.application;

import com.example.fleet.domain.model.Seat;
import com.example.fleet.domain.model.Vehicle;
import com.example.fleet.domain.repository.SeatRepository;
import com.example.fleet.domain.repository.VehicleRepository;
import com.example.fleet.infrastructure.exception.ResourceNotFoundException;
import com.example.fleet.infrastructure.exception.ConflictException;
import com.example.fleet.presentation.dto.seat.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatService {

    private final SeatRepository seatRepository;
    private final VehicleRepository vehicleRepository;

    public List<SeatResponseDTO> getAllSeats() {
        log.info("Fetching all seats");
        return seatRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<SeatResponseDTO> getSeatsByVehicleId(Integer vehicleId) {
        log.info("Fetching seats for vehicle id={}", vehicleId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        List<Seat> seats = seatRepository.findByVehicleId(vehicleId);

        return seats.stream()
                .map(seat -> {
                    SeatResponseDTO dto = SeatResponseDTO.fromEntity(seat);
                    if (vehicle != null) {
                        dto.setVehicleName(vehicle.getName());
                        dto.setVehicleLicensePlate(vehicle.getLicensePlate());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<SeatResponseDTO> getAvailableSeatsByVehicleId(Integer vehicleId) {
        log.info("Fetching available seats for vehicle id={}", vehicleId);
        return seatRepository.findByVehicleIdAndStatus(vehicleId, Seat.SeatStatus.AVAILABLE)
                .stream()
                .map(SeatResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<SeatResponseDTO> generateSeatsForVehicle(Integer vehicleId, GenerateSeatsRequestDTO request) {
        log.info("Generating seats for vehicle id={}", vehicleId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (seatRepository.existsByVehicleId(vehicleId)) {
            throw new ConflictException("Seats already exist for this vehicle. Delete existing seats first.");
        }

        List<Seat> generatedSeats = new ArrayList<>();
        int seatCounter = 1;

        for (SeatConfigDTO config : request.getSeatConfig()) {
            for (int i = 0; i < config.getQuantity(); i++) {
                Seat seat = Seat.builder()
                        .vehicleId(vehicleId)
                        .seatNumber(String.format("%02d", seatCounter++))
                        .seatType(config.getSeatType())
                        .priceForTypeSeat(config.getPrice())
                        .status(Seat.SeatStatus.AVAILABLE)
                        .build();
                generatedSeats.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(generatedSeats);
        log.info("Generated {} seats for vehicle id={}", savedSeats.size(), vehicleId);

        return savedSeats.stream()
                .map(seat -> {
                    SeatResponseDTO dto = SeatResponseDTO.fromEntity(seat);
                    dto.setVehicleName(vehicle.getName());
                    dto.setVehicleLicensePlate(vehicle.getLicensePlate());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public SeatResponseDTO updateSeatStatus(Integer seatId, Seat.SeatStatus status) {
        log.info("Updating seat id={} status to {}", seatId, status);

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));

        seat.setStatus(status);
        Seat updated = seatRepository.save(seat);

        log.info("Seat status updated successfully id={}", seatId);
        return SeatResponseDTO.fromEntity(updated);
    }

    @Transactional
    public void deleteSeatsByVehicleId(Integer vehicleId) {
        log.info("Deleting all seats for vehicle id={}", vehicleId);
        seatRepository.deleteByVehicleId(vehicleId);
        log.info("All seats deleted for vehicle id={}", vehicleId);
    }

    /**
     * Updates seat status based on ticket events from Kafka.
     * This is called by TicketEventConsumer when receiving events from
     * ticket-service.
     */
    @Transactional
    public void updateSeatStatusFromTicketEvent(Integer seatId, Seat.SeatStatus status) {
        log.info("Updating seat id={} status to {} from ticket event", seatId, status);

        seatRepository.findById(seatId).ifPresentOrElse(
                seat -> {
                    seat.setStatus(status);
                    seatRepository.save(seat);
                    log.info("Seat id={} status updated to {} successfully", seatId, status);
                },
                () -> log.warn("Seat not found with id={}, cannot update status from ticket event", seatId));
    }

    private SeatResponseDTO toResponseDTO(Seat seat) {
        SeatResponseDTO dto = SeatResponseDTO.fromEntity(seat);
        vehicleRepository.findById(seat.getVehicleId()).ifPresent(vehicle -> {
            dto.setVehicleName(vehicle.getName());
            dto.setVehicleLicensePlate(vehicle.getLicensePlate());
        });
        return dto;
    }
}
