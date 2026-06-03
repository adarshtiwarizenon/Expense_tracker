package com.example.expense_tracker.repository;

import com.example.expense_tracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Spring Data JPA — no implementation needed, queries are auto-generated from method names
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used by CustomUserDetailsService to load the user during JWT validation
    Optional<User> findByEmail(String email);

    // Used during registration to prevent duplicate accounts
    boolean existsByEmail(String email);
}