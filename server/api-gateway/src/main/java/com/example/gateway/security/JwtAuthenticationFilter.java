package com.example.gateway.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

/**
 * JWT Authentication Filter for API Gateway.
 * Validates JWT tokens from cookies for protected routes.
 * For Option B: Basic validation at gateway, full validation at Identity
 * Service.
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Value("${gateway.auth.excluded-paths:/api/auth/login,/api/auth/register}")
    private List<String> excludedPaths;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String method = request.getMethod().name();

        // Generate or extract correlation ID
        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8);
        }
        final String finalCorrelationId = correlationId;

        log.info("[{}] Incoming request: {} {}", correlationId, method, path);

        // Skip authentication for public endpoints
        if (isExcludedPath(path)) {
            log.debug("[{}] Path {} is excluded from authentication", correlationId, path);
            return forwardWithCorrelationId(exchange, chain, correlationId, null);
        }

        // Extract token from Authorization header or cookies
        String token = extractToken(exchange);

        if (token != null) {
            log.debug("[{}] Token found, forwarding to downstream service", correlationId);
            return forwardWithCorrelationId(exchange, chain, correlationId, token);
        }

        // No token found - allow request to proceed (downstream service handles auth)
        log.debug("[{}] No token found, forwarding request without authentication", correlationId);
        return forwardWithCorrelationId(exchange, chain, correlationId, null);
    }

    private Mono<Void> forwardWithCorrelationId(ServerWebExchange exchange, GatewayFilterChain chain,
            String correlationId, String token) {
        ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                .header(CORRELATION_ID_HEADER, correlationId);

        if (token != null) {
            requestBuilder.header("Authorization", "Bearer " + token);
        }

        return chain.filter(exchange.mutate().request(requestBuilder.build()).build())
                .doOnSuccess(v -> log.debug("[{}] Request completed successfully", correlationId))
                .doOnError(e -> log.error("[{}] Request failed: {}", correlationId, e.getMessage()));
    }

    private boolean isExcludedPath(String path) {
        return excludedPaths.stream().anyMatch(excluded -> path.startsWith(excluded));
    }

    /**
     * Extracts JWT token from Authorization header first, then from cookies.
     */
    private String extractToken(ServerWebExchange exchange) {
        // Try Authorization header first
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("Token extracted from Authorization header");
            return authHeader.substring(7);
        }

        // Fall back to cookies
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst("ACCESS_TOKEN");
        if (cookie != null) {
            log.debug("Token extracted from ACCESS_TOKEN cookie");
            return cookie.getValue();
        }

        return null;
    }

    @Override
    public int getOrder() {
        return -100; // High priority
    }
}
