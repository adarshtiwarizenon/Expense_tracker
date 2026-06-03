package com.example.expense_tracker.security;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Spring Security calls loadUserByUsername in two places:
// 1. During login — DaoAuthenticationProvider calls it to fetch the user and compare passwords
// 2. During JWT filter — JwtAuthenticationFilter calls it after extracting the email from the token
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // "username" here is the email address — Spring Security uses the term generically
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserPrincipal.create(user); // wrap User entity in UserPrincipal so Spring Security can use it
    }
}