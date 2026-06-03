package com.example.expense_tracker.security;

import com.example.expense_tracker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

// Adapter that wraps the User entity so Spring Security can work with it.
// Spring Security knows nothing about our User entity — it only understands UserDetails.
// This class bridges the two.
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String password; // BCrypt hash — used by DaoAuthenticationProvider during login
    private String fullName;

    // Factory method — converts a User entity into a UserPrincipal
    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getFullName()
        );
    }

    // No roles/permissions in this app — returns empty list
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    // Spring Security uses email as the "username"
    @Override
    public String getUsername() {
        return email;
    }

    // These return true because we don't implement account locking or expiry
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}