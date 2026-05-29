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
public class AnalyticsMetricsResponse {
    private double savingsRatio;
    private String highestSpendingCategory;
    private BigDecimal highestSpendingAmount;
    private BigDecimal currentMonthExpenses;
    private BigDecimal previousMonthExpenses;
    private double monthOverMonthChange;
}