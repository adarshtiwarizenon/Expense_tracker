package com.example.expense_tracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Returned by both /register and /login on success
// The frontend stores token in localStorage and uses userId/email/fullName for the current user state
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;      // JWT — frontend sends this as "Authorization: Bearer <token>" on every request

    @Builder.Default
    private String type = "Bearer"; // token type, always Bearer for JWT

    private Long userId;
    private String email;
    private String fullName;
}