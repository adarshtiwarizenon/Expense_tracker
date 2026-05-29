package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getSummary();
}