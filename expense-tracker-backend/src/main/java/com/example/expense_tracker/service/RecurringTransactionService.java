package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.request.RecurringTransactionRequest;
import com.example.expense_tracker.dto.response.RecurringTransactionResponse;

import java.util.List;

public interface RecurringTransactionService {

    List<RecurringTransactionResponse> getAll();

    RecurringTransactionResponse getById(Long id);

    RecurringTransactionResponse create(RecurringTransactionRequest request);

    RecurringTransactionResponse update(Long id, RecurringTransactionRequest request);

    void delete(Long id);

    int processDueRecurringTransactions();
}