package com.example.schedule.infrastructure.grpc;

import com.example.schedule.domain.model.VehicleSchedule;
import com.example.schedule.domain.repository.VehicleScheduleRepository;
import com.example.schedule.infrastructure.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduleSearchGrpcService extends ScheduleSearchServiceGrpc.ScheduleSearchServiceImplBase {

    private final VehicleScheduleRepository vehicleScheduleRepository;

    @Override
    public void searchSchedules(ScheduleSearchRequest request,
            StreamObserver<ScheduleSearchResponse> responseObserver) {
        try {
            int routeId = request.getRouteId();
            String departureDateStr = request.getDepartureDate();

            List<VehicleSchedule> schedules;

            if (!departureDateStr.isEmpty()) {
                LocalDate date = LocalDate.parse(departureDateStr, DateTimeFormatter.ISO_LOCAL_DATE);
                LocalDateTime startOfDay = date.atStartOfDay();
                LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
                schedules = vehicleScheduleRepository.findByRouteIdAndDepartureDate(routeId, startOfDay, endOfDay);
            } else {
                schedules = vehicleScheduleRepository.findByRouteId(routeId);
            }

            ScheduleSearchResponse.Builder responseBuilder = ScheduleSearchResponse.newBuilder();
            for (VehicleSchedule s : schedules) {
                ScheduleMatch.Builder matchBuilder = ScheduleMatch.newBuilder()
                        .setId(s.getId())
                        .setRouteId(s.getRouteId())
                        .setBusId(s.getBusId())
                        .setAvailableSeats(s.getAvailableSeats() != null ? s.getAvailableSeats() : 0)
                        .setTotalSeats(s.getTotalSeats() != null ? s.getTotalSeats() : 0)
                        .setStatus(s.getStatus() != null ? s.getStatus().name() : "");

                if (s.getDepartureTime() != null) {
                    matchBuilder.setDepartureTime(s.getDepartureTime().toString());
                }
                if (s.getArrivalTime() != null) {
                    matchBuilder.setArrivalTime(s.getArrivalTime().toString());
                }

                responseBuilder.addSchedules(matchBuilder.build());
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in searchSchedules", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }
}
