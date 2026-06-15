package com.example.route.infrastructure.config;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.example.route.infrastructure.grpc.RouteSearchGrpcService;

@Configuration
@Slf4j
public class GrpcServerConfig {

    @Value("${grpc.server.port:9093}")
    private int grpcPort;

    private Server server;

    private final RouteSearchGrpcService routeSearchGrpcService;

    public GrpcServerConfig(RouteSearchGrpcService routeSearchGrpcService) {
        this.routeSearchGrpcService = routeSearchGrpcService;
    }

    @PostConstruct
    public void startGrpcServer() throws Exception {
        server = ServerBuilder.forPort(grpcPort)
                .addService(routeSearchGrpcService)
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
