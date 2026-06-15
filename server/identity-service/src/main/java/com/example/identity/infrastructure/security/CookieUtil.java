package com.example.identity.infrastructure.security;

import org.springframework.http.ResponseCookie;

public class CookieUtil {

    public static ResponseCookie accessCookie(String token, boolean secure) {
        String sameSite = secure ? "None" : "Lax";
        return ResponseCookie.from("ACCESS_TOKEN", token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(900) // 15 minutes
                .build();
    }

    public static ResponseCookie refreshCookie(String token, boolean secure) {
        String sameSite = secure ? "None" : "Lax";
        return ResponseCookie.from("REFRESH_TOKEN", token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(604800) // 7 days
                .build();
    }

    public static ResponseCookie clearCookie(String name, boolean secure) {
        String sameSite = secure ? "None" : "Lax";
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }

    public static ResponseCookie clearAccessCookie() {
        return clearCookie("ACCESS_TOKEN", false);
    }

    public static ResponseCookie clearRefreshCookie() {
        return clearCookie("REFRESH_TOKEN", false);
    }
}
