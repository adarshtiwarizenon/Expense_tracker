package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.response.*;
import com.example.expense_tracker.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/category-distribution")
    public ResponseEntity<ApiResponse<List<CategoryDistributionResponse>>> getCategoryDistribution(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category distribution fetched successfully",
                analyticsService.getCategoryDistribution(month)));
    }

    @GetMapping("/monthly-comparison")
    public ResponseEntity<ApiResponse<List<MonthlyComparisonResponse>>> getMonthlyComparison(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(ApiResponse.success(
                "Monthly comparison fetched successfully",
                analyticsService.getMonthlyComparison(months)));
    }

    @GetMapping("/expense-trend")
    public ResponseEntity<ApiResponse<List<ExpenseTrendResponse>>> getExpenseTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                "Expense trend fetched successfully",
                analyticsService.getExpenseTrend(startDate, endDate)));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AnalyticsMetricsResponse>> getMetrics() {
        return ResponseEntity.ok(ApiResponse.success(
                "Analytics metrics fetched successfully",
                analyticsService.getMetrics()));
    }
}