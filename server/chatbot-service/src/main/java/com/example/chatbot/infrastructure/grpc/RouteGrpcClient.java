package com.example.chatbot.infrastructure.grpc;

import com.example.chatbot.infrastructure.grpc.proto.*;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class RouteGrpcClient {

    @Value("${grpc.client.route-service.host:localhost}")
    private String host;

    @Value("${grpc.client.route-service.port:9093}")
    private int port;

    private ManagedChannel channel;
    private RouteSearchServiceGrpc.RouteSearchServiceBlockingStub blockingStub;

    @PostConstruct
    public void init() {
        channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        blockingStub = RouteSearchServiceGrpc.newBlockingStub(channel);
        log.info("RouteGrpcClient connected to {}:{}", host, port);
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        if (channel != null) {
            channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
        }
    }

    public StationSearchResponse searchStations(List<Double> embedding, int topK) {
        EmbeddingSearchRequest request = EmbeddingSearchRequest.newBuilder()
                .addAllEmbedding(embedding)
                .setTopK(topK)
                .build();
        return blockingStub.searchStations(request);
    }

    public RouteSearchResponse searchRoutes(int departureStationId, int arrivalStationId) {
        RouteSearchRequest request = RouteSearchRequest.newBuilder()
                .setDepartureStationId(departureStationId)
                .setArrivalStationId(arrivalStationId)
                .build();
        return blockingStub.searchRoutes(request);
    }
}
