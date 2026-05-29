package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.response.ApiResponse;
import com.example.expense_tracker.dto.response.DashboardResponse;
import com.example.expense_tracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardResponse>> getSummary() {
        DashboardResponse summary = dashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary fetched successfully", summary));
    }
}