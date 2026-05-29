package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.dto.response.AnalyticsMetricsResponse;
import com.example.expense_tracker.dto.response.CategoryDistributionResponse;
import com.example.expense_tracker.dto.response.ExpenseTrendResponse;
import com.example.expense_tracker.dto.response.MonthlyComparisonResponse;
import com.example.expense_tracker.entity.enums.TransactionType;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.service.AnalyticsService;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDistributionResponse> getCategoryDistribution(String month) {
        Long userId = securityUtil.getCurrentUserId();

        YearMonth ym = (month != null && !month.isBlank())
                ? YearMonth.parse(month)
                : YearMonth.now();

        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Object[]> rows = transactionRepository.findCategoryBreakdown(
                userId, TransactionType.EXPENSE, startDate, endDate);

        BigDecimal total = rows.stream()
                .map(row -> (BigDecimal) row[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return rows.stream()
                .map(row -> {
                    BigDecimal amount = (BigDecimal) row[2];
                    double percentage = total.compareTo(BigDecimal.ZERO) > 0
                            ? amount.multiply(BigDecimal.valueOf(100))
                              .divide(total, 2, RoundingMode.HALF_UP)
                              .doubleValue()
                            : 0.0;

                    return CategoryDistributionResponse.builder()
                            .categoryId(((Number) row[0]).longValue())
                            .categoryName((String) row[1])
                            .totalAmount(amount)
                            .percentage(percentage)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyComparisonResponse> getMonthlyComparison(int months) {
        Long userId = securityUtil.getCurrentUserId();

        int monthsBack = (months <= 0) ? 6 : months;
        LocalDate startDate = YearMonth.now().minusMonths(monthsBack - 1L).atDay(1);

        List<Object[]> rows = transactionRepository.findMonthlyComparison(userId, startDate);

        return rows.stream()
                .map(row -> {
                    String monthStr = (String) row[0];
                    BigDecimal income = toBigDecimal(row[1]);
                    BigDecimal expense = toBigDecimal(row[2]);
                    BigDecimal savings = income.subtract(expense);

                    return MonthlyComparisonResponse.builder()
                            .month(monthStr)
                            .income(income)
                            .expense(expense)
                            .savings(savings)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseTrendResponse> getExpenseTrend(LocalDate startDate, LocalDate endDate) {
        Long userId = securityUtil.getCurrentUserId();

        LocalDate effectiveStart = (startDate != null) ? startDate : LocalDate.now().minusMonths(1);
        LocalDate effectiveEnd = (endDate != null) ? endDate : LocalDate.now();

        List<Object[]> rows = transactionRepository.findExpenseTrend(userId, effectiveStart, effectiveEnd);

        return rows.stream()
                .map(row -> ExpenseTrendResponse.builder()
                        .date((LocalDate) row[0])
                        .amount((BigDecimal) row[1])
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsMetricsResponse getMetrics() {
        Long userId = securityUtil.getCurrentUserId();

        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);

        LocalDate currStart = currentMonth.atDay(1);
        LocalDate currEnd = currentMonth.atEndOfMonth();
        LocalDate prevStart = previousMonth.atDay(1);
        LocalDate prevEnd = previousMonth.atEndOfMonth();

        BigDecimal currIncome = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.INCOME, currStart, currEnd);
        BigDecimal currExpense = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.EXPENSE, currStart, currEnd);
        BigDecimal prevExpense = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.EXPENSE, prevStart, prevEnd);

        // Savings ratio
        double savingsRatio = 0.0;
        if (currIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRatio = currIncome.subtract(currExpense)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(currIncome, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Highest spending category (current month)
        List<Object[]> breakdown = transactionRepository.findCategoryBreakdown(
                userId, TransactionType.EXPENSE, currStart, currEnd);

        String highestCategory = "N/A";
        BigDecimal highestAmount = BigDecimal.ZERO;
        if (!breakdown.isEmpty()) {
            Object[] top = breakdown.get(0);
            highestCategory = (String) top[1];
            highestAmount = (BigDecimal) top[2];
        }

        // Month over month change
        double momChange = 0.0;
        if (prevExpense.compareTo(BigDecimal.ZERO) > 0) {
            momChange = currExpense.subtract(prevExpense)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(prevExpense, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return AnalyticsMetricsResponse.builder()
                .savingsRatio(savingsRatio)
                .highestSpendingCategory(highestCategory)
                .highestSpendingAmount(highestAmount)
                .currentMonthExpenses(currExpense)
                .previousMonthExpenses(prevExpense)
                .monthOverMonthChange(momChange)
                .build();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        return new BigDecimal(value.toString());
    }
}