package com.example.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class GatewayConfig {

        private static final Logger log = LoggerFactory.getLogger(GatewayConfig.class);

        @PostConstruct
        public void init() {
                log.info("API Gateway routes configured:");
                log.info("  - /files/**        -> http://localhost:8082 (Fleet Service - Static Files)");
                log.info("  - /api/auth/**     -> http://localhost:8081 (Identity Service)");
                log.info("  - /api/bus-companies/** -> http://localhost:8082 (Company Service)");
                log.info("  - /api/routes/**   -> http://localhost:8083 (Route Service)");
                log.info("  - /api/schedules/** -> http://localhost:8084 (Schedule Service)");
                log.info("  - /api/bookings/** -> http://localhost:8085 (Booking Service)");
                log.info("  - /api/reviews/**  -> http://localhost:8086 (Review Service)");
                log.info("  - /api/chatbot/**  -> http://localhost:8087 (Chatbot Service)");
        }

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                // Static Files - Serve uploaded images from fleet-service
                                .route("fleet-service-files", r -> r
                                                .path("/files/vehicle/**", "/files/bus_company/**")
                                                .uri("http://localhost:8082"))

                                // Identity Service - Authentication endpoints
                                .route("identity-service", r -> r
                                                .path("/api/auth/**")
                                                .filters(f -> f.stripPrefix(1)) // Remove /api prefix
                                                .uri("http://localhost:8081"))

                                // Fleet Service - Companies, Vehicles, Seats
                                .route("fleet-service-companies", r -> r
                                                .path("/api/bus-companies/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8082"))

                                .route("fleet-service-vehicles", r -> r
                                                .path("/api/vehicles/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8082"))

                                .route("fleet-service-seats", r -> r
                                                .path("/api/seats/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8082"))

                                // Route Service - Routes
                                .route("route-service-routes", r -> r
                                                .path("/api/routes/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8083"))

                                // Route Service - Stations
                                .route("route-service-stations", r -> r
                                                .path("/api/stations/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8083"))

                                // Route Service - Static Files
                                .route("route-service-files", r -> r
                                                .path("/files/station/**")

                                                .uri("http://localhost:8083"))

                                // Schedule Service - Vehicle Schedules
                                .route("schedule-service", r -> r
                                                .path("/api/vehicle-schedules/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8084"))

                                // Booking Service
                                .route("booking-service", r -> r
                                                .path("/api/bookings/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8085"))

                                // Chatbot Service
                                .route("chatbot-service", r -> r
                                                .path("/api/chatbot/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8087"))

                                // Ticket Service
                                .route("ticket-service", r -> r
                                                .path("/api/tickets/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8085"))
                                // Notification Service
                                .route("notification-service", r -> r
                                                .path("/api/notifications/**")
                                                .filters(f -> f.stripPrefix(1))
                                                .uri("http://localhost:8086"))

                                .build();
        }
}
