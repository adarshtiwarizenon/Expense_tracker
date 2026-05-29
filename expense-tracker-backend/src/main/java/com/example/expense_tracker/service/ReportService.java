package com.example.expense_tracker.service;

import com.example.expense_tracker.entity.enums.TransactionType;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    byte[] exportTransactionsCsv(LocalDate startDate, LocalDate endDate, TransactionType type, List<Long> categoryIds);
    byte[] exportTransactionsPdf(LocalDate startDate, LocalDate endDate, TransactionType type, List<Long> categoryIds);
}