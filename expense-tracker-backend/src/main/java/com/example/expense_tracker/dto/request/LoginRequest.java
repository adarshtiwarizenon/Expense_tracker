package com.example.expense_tracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// Incoming request body for POST /api/auth/login
@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // No @Size here — we only need to check it's not blank; the hash comparison handles invalid passwords
    @NotBlank(message = "Password is required")
    private String password;
}