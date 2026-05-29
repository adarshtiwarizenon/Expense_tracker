package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.request.BudgetRequest;
import com.example.expense_tracker.dto.response.ApiResponse;
import com.example.expense_tracker.dto.response.BudgetResponse;
import com.example.expense_tracker.dto.response.BudgetUtilizationResponse;
import com.example.expense_tracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Budgets fetched successfully", budgetService.getAllBudgets()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Budget fetched successfully", budgetService.getBudgetById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> create(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse created = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully",
                budgetService.updateBudget(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully"));
    }

    @GetMapping("/utilization")
    public ResponseEntity<ApiResponse<List<BudgetUtilizationResponse>>> getUtilization(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.success("Budget utilization fetched successfully",
                budgetService.getUtilization(month)));
    }
}