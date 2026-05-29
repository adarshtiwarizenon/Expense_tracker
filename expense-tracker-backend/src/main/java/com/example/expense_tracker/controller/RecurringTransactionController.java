package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.request.RecurringTransactionRequest;
import com.example.expense_tracker.dto.response.ApiResponse;
import com.example.expense_tracker.dto.response.RecurringTransactionResponse;
import com.example.expense_tracker.service.RecurringTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringTransactionResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                "Recurring transactions fetched successfully", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Recurring transaction fetched successfully", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> create(
            @Valid @RequestBody RecurringTransactionRequest request) {
        RecurringTransactionResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Recurring transaction created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> update(
            @PathVariable Long id, @Valid @RequestBody RecurringTransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Recurring transaction updated successfully", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Recurring transaction deleted successfully"));
    }

    @PostMapping("/trigger-now")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> triggerManually() {
        int count = service.processDueRecurringTransactions();
        return ResponseEntity.ok(ApiResponse.success(
                "Manual trigger executed",
                Map.of("transactionsCreated", count)));
    }
}