package com.example.identity.presentation;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.identity.application.AuthService;
import com.example.identity.domain.model.User;
import com.example.identity.infrastructure.security.CookieUtil;
import com.example.identity.infrastructure.security.JwtTokenProvider;
import com.example.identity.presentation.dto.LoginRequest;
import com.example.identity.presentation.dto.LoginResponse;
import com.example.identity.presentation.dto.RegisterRequest;
import com.example.identity.presentation.dto.RegisterResponse;
import com.example.identity.presentation.dto.UserResponseDTO;

import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        log.info("POST /auth/login - Request received for: {}", request.getEmail());
        LoginResponse loginResponse = authService.login(request);

        // Create and set the ACCESS_TOKEN cookie
        boolean isSecure = false; // Change to true in production
        ResponseCookie accessCookie = CookieUtil.accessCookie(loginResponse.getToken(), isSecure);

        log.info("POST /auth/login - Login successful for: {}", request.getEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        log.info("POST /auth/register - Request received for: {}", request.getEmail());
        RegisterResponse response = authService.register(request);
        log.info("POST /auth/register - Registration successful for: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getProfile(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            throw new RuntimeException("No authentication token found");
        }

        String email = jwtTokenProvider.getEmail(token);
        User user = authService.getUserByEmail(email);

        return ResponseEntity.ok(UserResponseDTO.fromEntity(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        ResponseCookie clearCookie = CookieUtil.clearAccessCookie();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(response);
    }

    /**
     * Validate token endpoint - used by other services to validate tokens
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);

        Map<String, Object> response = new HashMap<>();

        if (token == null) {
            response.put("valid", false);
            response.put("message", "No token provided");
            return ResponseEntity.ok(response);
        }

        boolean isValid = jwtTokenProvider.validateToken(token);
        response.put("valid", isValid);

        if (isValid) {
            String userId = jwtTokenProvider.getSubject(token);
            String email = jwtTokenProvider.getEmail(token);
            User user = authService.getUserByEmail(email);
            response.put("userId", userId);
            response.put("email", email);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
        }

        return ResponseEntity.ok(response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        // Try Authorization header first
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // Try cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("ACCESS_TOKEN".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
