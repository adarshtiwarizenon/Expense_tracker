package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.request.TransactionRequest;
import com.example.expense_tracker.dto.response.PageResponse;
import com.example.expense_tracker.dto.response.TransactionResponse;
import com.example.expense_tracker.entity.enums.TransactionType;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {

    PageResponse<TransactionResponse> getAllTransactions(
            int page, int size, String sortBy, String sortDir,
            TransactionType type, List<Long> categoryIds,
            LocalDate startDate, LocalDate endDate
    );

    TransactionResponse getTransactionById(Long id);

    TransactionResponse createTransaction(TransactionRequest request);

    TransactionResponse updateTransaction(Long id, TransactionRequest request);

    void deleteTransaction(Long id);
}