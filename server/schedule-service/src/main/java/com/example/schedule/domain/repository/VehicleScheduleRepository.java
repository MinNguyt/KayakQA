package com.example.schedule.domain.repository;

import com.example.schedule.domain.model.VehicleSchedule;
import com.example.schedule.domain.model.VehicleSchedule.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleScheduleRepository
                extends JpaRepository<VehicleSchedule, Integer>, JpaSpecificationExecutor<VehicleSchedule> {

        List<VehicleSchedule> findByRouteId(Integer routeId);

        List<VehicleSchedule> findByBusId(Integer busId);

        List<VehicleSchedule> findByStatus(ScheduleStatus status);

        @Query("SELECT vs FROM VehicleSchedule vs WHERE " +
                        "(:routeId IS NULL OR vs.routeId = :routeId) AND " +
                        "(:busId IS NULL OR vs.busId = :busId) AND " +
                        "(:status IS NULL OR vs.status = :status)")
        Page<VehicleSchedule> findWithFilters(
                        @Param("routeId") Integer routeId,
                        @Param("busId") Integer busId,
                        @Param("status") ScheduleStatus status,
                        Pageable pageable);

        boolean existsByRouteIdAndBusId(Integer routeId, Integer busId);

        @Query("SELECT vs FROM VehicleSchedule vs WHERE " +
                        "vs.routeId = :routeId AND " +
                        "vs.departureTime >= :startDate AND vs.departureTime < :endDate AND " +
                        "vs.status = 'AVAILABLE'")
        List<VehicleSchedule> findByRouteIdAndDepartureDate(
                        @Param("routeId") Integer routeId,
                        @Param("startDate") java.time.LocalDateTime startDate,
                        @Param("endDate") java.time.LocalDateTime endDate);
}
