package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.constants.BudgetConstants;
import com.example.expense_tracker.dto.response.BudgetUtilizationResponse;
import com.example.expense_tracker.dto.response.DashboardResponse;
import com.example.expense_tracker.dto.response.TransactionResponse;
import com.example.expense_tracker.entity.enums.TransactionType;
import com.example.expense_tracker.mapper.TransactionMapper;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.service.BudgetService;
import com.example.expense_tracker.service.DashboardService;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final BudgetService budgetService;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        Long userId = securityUtil.getCurrentUserId();

        // Lifetime totals
        BigDecimal totalIncome = transactionRepository.sumByUserAndType(userId, TransactionType.INCOME);
        BigDecimal totalExpenses = transactionRepository.sumByUserAndType(userId, TransactionType.EXPENSE);
        BigDecimal currentBalance = totalIncome.subtract(totalExpenses);

        // Current month totals
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        BigDecimal monthlyIncome = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.INCOME, monthStart, monthEnd);
        BigDecimal monthlyExpenses = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.EXPENSE, monthStart, monthEnd);
        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);

        // Recent transactions
        List<TransactionResponse> recent = transactionRepository
                .findTop5ByUserIdOrderByDateDescCreatedAtDesc(userId).stream()
                .map(transactionMapper::toResponse)
                .toList();

        // Budget alerts (current month, only WARNING/EXCEEDED)
        String currentMonthStr = currentMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<BudgetUtilizationResponse> alerts = budgetService.getUtilization(currentMonthStr).stream()
                .filter(b -> !b.getStatus().equals(BudgetConstants.STATUS_NORMAL))
                .toList();

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .currentBalance(currentBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpenses(monthlyExpenses)
                .monthlySavings(monthlySavings)
                .recentTransactions(recent)
                .budgetAlerts(alerts)
                .build();
    }
}