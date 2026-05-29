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
public class MonthlyComparisonResponse {
    private String month;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;
}