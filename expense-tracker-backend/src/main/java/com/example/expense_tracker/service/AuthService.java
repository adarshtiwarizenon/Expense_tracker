package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.request.LoginRequest;
import com.example.expense_tracker.dto.request.RegisterRequest;
import com.example.expense_tracker.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}