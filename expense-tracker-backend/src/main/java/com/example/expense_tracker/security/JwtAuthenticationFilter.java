package com.example.expense_tracker.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Runs once per HTTP request (OncePerRequestFilter guarantees no double-execution).
// Reads the JWT from the Authorization header, validates it, and sets the authenticated user
// in the SecurityContext so the rest of the request pipeline knows who is calling.
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String token = extractTokenFromRequest(request);

            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                String email = jwtUtil.extractEmail(token);

                // Load full UserDetails (UserPrincipal) from DB using the email from the token
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Build an authenticated token — credentials are null because we trust the JWT
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                // Attach request details (IP, session) to the authentication object
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Store authentication in SecurityContext — this is what @AuthenticationPrincipal and SecurityUtil read
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            // If no token or invalid token: SecurityContext stays empty, request continues as anonymous
            // Spring Security's authorization rules will then reject it if the route is protected
        } catch (Exception e) {
            log.error("Could not set user authentication in security context: {}", e.getMessage());
        }

        // Always continue the filter chain — never short-circuit here (that's the security rules' job)
        filterChain.doFilter(request, response);
    }

    // Strips "Bearer " prefix from the Authorization header to get the raw token string
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // skip "Bearer " (7 characters)
        }
        return null;
    }
}