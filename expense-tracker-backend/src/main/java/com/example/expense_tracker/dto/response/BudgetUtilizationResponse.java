package com.example.expense_tracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetUtilizationResponse {
    private Long budgetId;
    private Long categoryId;
    private String categoryName;
    private String month;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double utilizationPercentage;
    private String status; // NORMAL / WARNING / EXCEEDED
}