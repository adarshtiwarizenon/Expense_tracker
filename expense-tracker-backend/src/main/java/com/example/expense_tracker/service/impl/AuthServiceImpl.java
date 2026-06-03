package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.dto.request.LoginRequest;
import com.example.expense_tracker.dto.request.RegisterRequest;
import com.example.expense_tracker.dto.response.AuthResponse;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.exception.BadRequestException;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.security.JwtUtil;
import com.example.expense_tracker.security.UserPrincipal;
import com.example.expense_tracker.service.AuthService;
import com.example.expense_tracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CategoryService categoryService;

    @Override
    @Transactional  // wraps user save + category seeding in one transaction — rolls back both if either fails
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Backend double-checks even though the frontend also validates — never trust client-only validation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash — never store plain text
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        // Create default categories (Food, Transport, etc.) so the user doesn't start with an empty app
        categoryService.seedDefaultCategories(savedUser);

        // Generate JWT immediately so the user is logged in right after registering
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String token = jwtUtil.generateToken(userPrincipal);

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // authenticationManager delegates to DaoAuthenticationProvider:
        // 1. Calls CustomUserDetailsService.loadUserByUsername(email) to fetch the user
        // 2. BCrypt-compares the submitted password with the stored hash
        // 3. Throws BadCredentialsException if wrong — caught by GlobalExceptionHandler
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Store authentication in SecurityContext for the duration of this request
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String token = jwtUtil.generateToken(userPrincipal);
        log.info("User logged in successfully: {}", userPrincipal.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .build();
    }
}