package com.example.expense_tracker.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Handles all JWT operations: generate, validate, and extract claims.
// Used by AuthServiceImpl (to generate token) and JwtAuthenticationFilter (to validate + extract email).
@Slf4j
@Component
public class JwtUtil {

    // Secret key and expiry loaded from application.properties (app.jwt.secret, app.jwt.expiration-ms)
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    // Converts the plain-text secret into an HMAC-SHA key used for signing/verifying the token
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Creates a signed JWT with email as subject and userId/fullName as custom claims
    // Called after successful login or registration
    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userPrincipal.getEmail())          // standard "sub" claim
                .claim("userId", userPrincipal.getId())     // custom claim — used by SecurityUtil
                .claim("fullName", userPrincipal.getFullName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact(); // produces the final Base64-encoded token string
    }

    // Extracts the email (subject) from the token — used by JwtAuthenticationFilter
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extracts the userId custom claim — used if needed without a DB lookup
    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    // Returns true if token signature is valid and not expired; false otherwise
    // Catches all JWT exceptions (expired, malformed, wrong signature) and logs them
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    // Parses and returns the full claims payload from a token
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}