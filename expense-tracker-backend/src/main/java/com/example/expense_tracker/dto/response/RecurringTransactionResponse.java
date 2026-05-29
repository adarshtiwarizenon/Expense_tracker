package com.example.expense_tracker.dto.response;

import com.example.expense_tracker.entity.enums.Frequency;
import com.example.expense_tracker.entity.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTransactionResponse {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private Frequency frequency;
    private LocalDate nextExecution;
    private String description;
    private Long categoryId;
    private String categoryName;
}