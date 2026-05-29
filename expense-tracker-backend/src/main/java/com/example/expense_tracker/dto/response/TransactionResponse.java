package com.example.expense_tracker.dto.response;

import com.example.expense_tracker.entity.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate date;
    private String description;
    private String paymentMethod;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
}