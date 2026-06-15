package com.example.schedule.infrastructure.config;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.example.schedule.infrastructure.grpc.ScheduleSearchGrpcService;

@Configuration
@Slf4j
public class GrpcServerConfig {

    @Value("${grpc.server.port:9094}")
    private int grpcPort;

    private Server server;

    private final ScheduleSearchGrpcService scheduleSearchGrpcService;

    public GrpcServerConfig(ScheduleSearchGrpcService scheduleSearchGrpcService) {
        this.scheduleSearchGrpcService = scheduleSearchGrpcService;
    }

    @PostConstruct
    public void startGrpcServer() throws Exception {
        server = ServerBuilder.forPort(grpcPort)
                .addService(scheduleSearchGrpcService)
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
