package com.example.identity.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValidityMs;
    private final long refreshTokenValidityMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access.expiration:90000000}") long accessTokenValidityMs,
            @Value("${jwt.refresh.expiration:604800000}") long refreshTokenValidityMs) {
        this.secretKey = createSecureKey(secret);
        this.accessTokenValidityMs = accessTokenValidityMs;
        this.refreshTokenValidityMs = refreshTokenValidityMs;
        log.info("JwtTokenProvider initialized with access token validity: {}ms", accessTokenValidityMs);
    }

    public String generateAccessToken(String subject) {
        log.debug("Generating access token for subject: {}", subject);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidityMs);
        String token = Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
        log.debug("Access token generated successfully for: {}", subject);
        return token;
    }

    /**
     * Generates an access token with userId as subject and email as a claim.
     * This allows downstream services to extract both the userId (for
     * authorization)
     * and email (for user lookup) from the token.
     */
    public String generateAccessToken(Integer userId, String email, String role) {
        log.debug("Generating access token for userId: {}, email: {}", userId, email);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidityMs);
        String token = Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
        log.debug("Access token generated successfully for userId: {}", userId);
        return token;
    }

    public String generateRefreshToken(String subject) {
        log.debug("Generating refresh token for subject: {}", subject);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenValidityMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            log.debug("Token validation successful");
            return true;
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String getSubject(String token) {
        return getClaims(token).getSubject();
    }

    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private SecretKey createSecureKey(String secret) {
        byte[] keyBytes = tryDecodeBase64(secret);
        if (keyBytes == null || keyBytes.length < 32) {
            keyBytes = sha256(secret);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private byte[] tryDecodeBase64(String value) {
        try {
            return Base64.getDecoder().decode(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private byte[] sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
