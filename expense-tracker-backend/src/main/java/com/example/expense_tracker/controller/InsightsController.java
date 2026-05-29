package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.response.ApiResponse;
import com.example.expense_tracker.dto.response.InsightResponse;
import com.example.expense_tracker.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InsightResponse>>> getInsights() {
        return ResponseEntity.ok(ApiResponse.success(
                "Insights fetched successfully",
                insightsService.getInsights()));
    }
}