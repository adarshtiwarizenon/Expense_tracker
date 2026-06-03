package com.example.expense_tracker.security;

import com.example.expense_tracker.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

// Triggered when an unauthenticated request hits a protected endpoint (no token or invalid token).
// Without this, Spring Security returns a plain HTML 401 page — this replaces it with a JSON response
// that matches our ErrorResponse format, so the frontend can parse it properly.
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper mapper;

    public CustomAuthenticationEntryPoint() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
        // Without this, LocalDateTime fields serialize as timestamp arrays [2024,1,1,...] instead of "2024-01-01T..."
        this.mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    // Called by Spring Security when authentication fails (no/bad token)
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());   // HTTP 401
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Unauthorized: Please login to access this resource")
                .path(request.getRequestURI())
                .build();

        mapper.writeValue(response.getOutputStream(), errorResponse);
    }
}