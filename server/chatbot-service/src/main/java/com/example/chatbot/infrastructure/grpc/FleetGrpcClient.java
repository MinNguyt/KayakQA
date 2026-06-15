package com.example.chatbot.infrastructure.grpc;

import com.example.chatbot.infrastructure.grpc.proto.*;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class FleetGrpcClient {

    @Value("${grpc.client.fleet-service.host:localhost}")
    private String host;

    @Value("${grpc.client.fleet-service.port:9092}")
    private int port;

    private ManagedChannel channel;
    private FleetSearchServiceGrpc.FleetSearchServiceBlockingStub blockingStub;

    @PostConstruct
    public void init() {
        channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        blockingStub = FleetSearchServiceGrpc.newBlockingStub(channel);
        log.info("FleetGrpcClient connected to {}:{}", host, port);
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        if (channel != null) {
            channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
        }
    }

    public VehicleSearchResponse searchVehicles(int busId) {
        VehicleSearchRequest request = VehicleSearchRequest.newBuilder()
                .setBusId(busId)
                .build();
        return blockingStub.searchVehicles(request);
    }
}
