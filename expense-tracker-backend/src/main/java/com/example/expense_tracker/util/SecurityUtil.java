package com.example.expense_tracker.util;

import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.exception.UnauthorizedException;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// Utility used by every service to get the currently logged-in user.
// JwtAuthenticationFilter sets the UserPrincipal in SecurityContextHolder before the request reaches any service,
// so this is always safe to call inside a protected endpoint.
@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    // Fetches the full User entity from DB for the currently authenticated user.
    // Services use this to scope queries — e.g. "get all transactions WHERE user = getCurrentUser()"
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }

        // The principal was set by JwtAuthenticationFilter as a UserPrincipal
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    // Convenience method when only the ID is needed (avoids loading the full entity)
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}