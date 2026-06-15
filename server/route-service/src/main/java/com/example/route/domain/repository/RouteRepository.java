package com.example.route.domain.repository;

import com.example.route.domain.model.Route;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {

        @Query("SELECT r FROM Route r " +
                        "JOIN FETCH r.departureStation " +
                        "JOIN FETCH r.arrivalStation " +
                        "WHERE (:departureStationId IS NULL OR r.departureStation.id = :departureStationId) " +
                        "AND (:arrivalStationId IS NULL OR r.arrivalStation.id = :arrivalStationId)")
        Page<Route> findAllWithFilters(
                        Pageable pageable,
                        @Param("departureStationId") Integer departureStationId,
                        @Param("arrivalStationId") Integer arrivalStationId);

        @Query("SELECT r FROM Route r " +
                        "JOIN FETCH r.departureStation " +
                        "JOIN FETCH r.arrivalStation")
        Page<Route> findAllWithStations(Pageable pageable);

        @Query("SELECT r FROM Route r " +
                        "JOIN FETCH r.departureStation " +
                        "JOIN FETCH r.arrivalStation " +
                        "WHERE r.departureStation.id = :departureStationId " +
                        "AND r.arrivalStation.id = :arrivalStationId")
        List<Route> findByDepartureStationIdAndArrivalStationId(
                        @Param("departureStationId") Integer departureStationId,
                        @Param("arrivalStationId") Integer arrivalStationId);

        @Query("SELECT r FROM Route r " +
                        "JOIN FETCH r.departureStation " +
                        "JOIN FETCH r.arrivalStation " +
                        "WHERE r.departureStation.id = :departureStationId")
        List<Route> findByDepartureStationId(
                        @Param("departureStationId") Integer departureStationId);
}
