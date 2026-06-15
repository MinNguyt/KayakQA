package com.example.fleet.infrastructure.config;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.example.fleet.infrastructure.grpc.FleetSearchGrpcService;

@Configuration
@Slf4j
public class GrpcServerConfig {

    @Value("${grpc.server.port:9092}")
    private int grpcPort;

    private Server server;

    private final FleetSearchGrpcService fleetSearchGrpcService;

    public GrpcServerConfig(FleetSearchGrpcService fleetSearchGrpcService) {
        this.fleetSearchGrpcService = fleetSearchGrpcService;
    }

    @PostConstruct
    public void startGrpcServer() throws Exception {
        server = ServerBuilder.forPort(grpcPort)
                .addService(fleetSearchGrpcService)
                .build()
                .start();
        log.info("gRPC server started on port {}", grpcPort);
    }

    @PreDestroy
    public void stopGrpcServer() {
        if (server != null) {
            server.shutdown();
            log.info("gRPC server stopped");
        }
    }
}
