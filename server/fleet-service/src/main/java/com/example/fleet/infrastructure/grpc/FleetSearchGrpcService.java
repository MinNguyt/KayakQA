package com.example.fleet.infrastructure.grpc;

import com.example.fleet.domain.model.Vehicle;
import com.example.fleet.domain.repository.VehicleRepository;
import com.example.fleet.infrastructure.grpc.proto.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class FleetSearchGrpcService extends FleetSearchServiceGrpc.FleetSearchServiceImplBase {

    private final VehicleRepository vehicleRepository;

    @Override
    public void searchVehicles(VehicleSearchRequest request, StreamObserver<VehicleSearchResponse> responseObserver) {
        try {
            int busId = request.getBusId();

            Optional<Vehicle> vehicleOpt = vehicleRepository.findByIdWithBusCompany(busId);

            VehicleSearchResponse.Builder responseBuilder = VehicleSearchResponse.newBuilder();

            if (vehicleOpt.isPresent()) {
                Vehicle v = vehicleOpt.get();
                VehicleMatch.Builder matchBuilder = VehicleMatch.newBuilder()
                        .setId(v.getId())
                        .setName(v.getName() != null ? v.getName() : "")
                        .setLicensePlate(v.getLicensePlate() != null ? v.getLicensePlate() : "")
                        .setCapacity(v.getCapacity() != null ? v.getCapacity() : 0)
                        .setFeaturedImage(v.getFeaturedImage() != null ? v.getFeaturedImage() : "");

                if (v.getBusCompany() != null && v.getBusCompany().getCompanyName() != null) {
                    matchBuilder.setCompanyName(v.getBusCompany().getCompanyName());
                }

                responseBuilder.setVehicle(matchBuilder.build());
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in searchVehicles", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        }
    }
}
