package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.request.BudgetRequest;
import com.example.expense_tracker.dto.response.BudgetResponse;
import com.example.expense_tracker.dto.response.BudgetUtilizationResponse;

import java.util.List;

public interface BudgetService {

    List<BudgetResponse> getAllBudgets();

    BudgetResponse getBudgetById(Long id);

    BudgetResponse createBudget(BudgetRequest request);

    BudgetResponse updateBudget(Long id, BudgetRequest request);

    void deleteBudget(Long id);

    List<BudgetUtilizationResponse> getUtilization(String month);
}