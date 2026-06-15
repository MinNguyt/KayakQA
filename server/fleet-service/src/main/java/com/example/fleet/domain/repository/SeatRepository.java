package com.example.fleet.domain.repository;

import com.example.fleet.domain.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {

    List<Seat> findByVehicleId(Integer vehicleId);

    List<Seat> findByVehicleIdAndStatus(Integer vehicleId, Seat.SeatStatus status);

    boolean existsByVehicleId(Integer vehicleId);

    void deleteByVehicleId(Integer vehicleId);

    int countByVehicleId(Integer vehicleId);

    int countByVehicleIdAndStatus(Integer vehicleId, Seat.SeatStatus status);
}
