package com.example.expense_tracker.mapper;

import com.example.expense_tracker.dto.response.RecurringTransactionResponse;
import com.example.expense_tracker.entity.RecurringTransaction;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransactionMapper {

    public RecurringTransactionResponse toResponse(RecurringTransaction recurring) {
        return RecurringTransactionResponse.builder()
                .id(recurring.getId())
                .amount(recurring.getAmount())
                .type(recurring.getType())
                .frequency(recurring.getFrequency())
                .nextExecution(recurring.getNextExecution())
                .description(recurring.getDescription())
                .categoryId(recurring.getCategory().getId())
                .categoryName(recurring.getCategory().getName())
                .build();
    }
}