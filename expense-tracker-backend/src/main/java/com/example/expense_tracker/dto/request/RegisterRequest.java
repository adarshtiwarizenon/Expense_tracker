package com.example.expense_tracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Incoming request body for POST /api/auth/register
// @Valid on the controller method triggers these annotations automatically
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    // confirmPassword is checked manually in AuthServiceImpl — not stored in the database
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}