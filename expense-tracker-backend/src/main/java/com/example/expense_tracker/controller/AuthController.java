package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.request.LoginRequest;
import com.example.expense_tracker.dto.request.RegisterRequest;
import com.example.expense_tracker.dto.response.ApiResponse;
import com.example.expense_tracker.dto.response.AuthResponse;
import com.example.expense_tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Public endpoints — no JWT required (configured in SecurityConfig as permitAll)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register — creates account and returns JWT immediately (user is auto-logged-in)
    // @Valid triggers bean validation on RegisterRequest fields before the method body runs
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)   // 201 Created for new resource
                .body(ApiResponse.success("User registered successfully", response));
    }

    // POST /api/auth/login — verifies credentials and returns JWT
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}