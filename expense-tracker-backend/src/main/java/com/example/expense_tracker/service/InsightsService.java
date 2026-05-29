package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.response.InsightResponse;

import java.util.List;

public interface InsightsService {
    List<InsightResponse> getInsights();
}