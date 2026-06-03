package com.example.expense_tracker.security;

import com.example.expense_tracker.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

// Triggered when an authenticated user tries to access a resource they don't have permission for (HTTP 403).
// Different from CustomAuthenticationEntryPoint (401 = not logged in vs 403 = logged in but not allowed).
// In this app all users have equal access, so 403 would only occur if role-based restrictions were added later.
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper mapper;

    public CustomAccessDeniedHandler() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
        // Without this, LocalDateTime fields serialize as timestamp arrays instead of ISO strings
        this.mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    // Called by Spring Security when a logged-in user is denied access (insufficient permissions)
    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpStatus.FORBIDDEN.value());  // HTTP 403
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message("Forbidden: You don't have permission to access this resource")
                .path(request.getRequestURI())
                .build();

        mapper.writeValue(response.getOutputStream(), errorResponse);
    }
}