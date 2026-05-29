package com.example.expense_tracker.dto.request;

import com.example.expense_tracker.entity.enums.Frequency;
import com.example.expense_tracker.entity.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RecurringTransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required (INCOME or EXPENSE)")
    private TransactionType type;

    @NotNull(message = "Frequency is required (DAILY, WEEKLY, MONTHLY)")
    private Frequency frequency;

    @NotNull(message = "Next execution date is required")
    @FutureOrPresent(message = "Next execution date cannot be in the past")
    private LocalDate nextExecution;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}