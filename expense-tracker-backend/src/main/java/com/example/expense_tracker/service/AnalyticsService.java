package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.response.AnalyticsMetricsResponse;
import com.example.expense_tracker.dto.response.CategoryDistributionResponse;
import com.example.expense_tracker.dto.response.ExpenseTrendResponse;
import com.example.expense_tracker.dto.response.MonthlyComparisonResponse;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsService {

    List<CategoryDistributionResponse> getCategoryDistribution(String month);

    List<MonthlyComparisonResponse> getMonthlyComparison(int months);

    List<ExpenseTrendResponse> getExpenseTrend(LocalDate startDate, LocalDate endDate);

    AnalyticsMetricsResponse getMetrics();
}