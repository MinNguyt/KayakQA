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
public class ScheduleGrpcClient {

    @Value("${grpc.client.schedule-service.host:localhost}")
    private String host;

    @Value("${grpc.client.schedule-service.port:9094}")
    private int port;

    private ManagedChannel channel;
    private ScheduleSearchServiceGrpc.ScheduleSearchServiceBlockingStub blockingStub;

    @PostConstruct
    public void init() {
        channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        blockingStub = ScheduleSearchServiceGrpc.newBlockingStub(channel);
        log.info("ScheduleGrpcClient connected to {}:{}", host, port);
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        if (channel != null) {
            channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
        }
    }

    public ScheduleSearchResponse searchSchedules(int routeId, String departureDate) {
        ScheduleSearchRequest request = ScheduleSearchRequest.newBuilder()
                .setRouteId(routeId)
                .setDepartureDate(departureDate != null ? departureDate : "")
                .build();
        return blockingStub.searchSchedules(request);
    }
}
