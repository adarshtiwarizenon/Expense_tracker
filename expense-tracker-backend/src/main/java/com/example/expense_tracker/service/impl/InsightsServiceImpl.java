package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.constants.BudgetConstants;
import com.example.expense_tracker.dto.response.BudgetUtilizationResponse;
import com.example.expense_tracker.dto.response.InsightResponse;
import com.example.expense_tracker.entity.enums.TransactionType;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.service.BudgetService;
import com.example.expense_tracker.service.InsightsService;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsightsServiceImpl implements InsightsService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public List<InsightResponse> getInsights() {
        Long userId = securityUtil.getCurrentUserId();
        List<InsightResponse> insights = new ArrayList<>();

        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);

        LocalDate currStart = currentMonth.atDay(1);
        LocalDate currEnd = currentMonth.atEndOfMonth();
        LocalDate prevStart = previousMonth.atDay(1);
        LocalDate prevEnd = previousMonth.atEndOfMonth();

        // Insight 1: Overall expense comparison
        BigDecimal currTotal = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.EXPENSE, currStart, currEnd);
        BigDecimal prevTotal = transactionRepository.sumByUserAndTypeBetween(
                userId, TransactionType.EXPENSE, prevStart, prevEnd);

        if (prevTotal.compareTo(BigDecimal.ZERO) > 0) {
            double change = currTotal.subtract(prevTotal)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(prevTotal, 2, RoundingMode.HALF_UP)
                    .doubleValue();

            String message;
            String type;
            if (change > 0) {
                message = String.format("Your total expenses increased by %.1f%% compared to last month", change);
                type = "WARNING";
            } else if (change < 0) {
                message = String.format("Great! Your total expenses decreased by %.1f%% compared to last month", Math.abs(change));
                type = "INFO";
            } else {
                message = "Your expenses are the same as last month";
                type = "INFO";
            }
            insights.add(InsightResponse.builder().type(type).message(message).build());
        }

        // Insight 2: Category-wise comparison
        Map<String, BigDecimal> currCategoryMap = toCategoryMap(
                transactionRepository.findCategoryBreakdown(userId, TransactionType.EXPENSE, currStart, currEnd));
        Map<String, BigDecimal> prevCategoryMap = toCategoryMap(
                transactionRepository.findCategoryBreakdown(userId, TransactionType.EXPENSE, prevStart, prevEnd));

        for (Map.Entry<String, BigDecimal> entry : currCategoryMap.entrySet()) {
            String category = entry.getKey();
            BigDecimal currAmt = entry.getValue();
            BigDecimal prevAmt = prevCategoryMap.getOrDefault(category, BigDecimal.ZERO);

            if (prevAmt.compareTo(BigDecimal.ZERO) > 0) {
                double change = currAmt.subtract(prevAmt)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(prevAmt, 2, RoundingMode.HALF_UP)
                        .doubleValue();

                if (Math.abs(change) >= 10) { // only meaningful changes
                    String msg = (change > 0)
                            ? String.format("%s spending increased by %.1f%% this month", category, change)
                            : String.format("%s spending decreased by %.1f%% this month", category, Math.abs(change));

                    insights.add(InsightResponse.builder()
                            .type(change > 0 ? "WARNING" : "INFO")
                            .category(category)
                            .message(msg)
                            .build());
                }
            }
        }

        // Insight 3: Budget alerts
        String currentMonthStr = currentMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        for (BudgetUtilizationResponse budget : budgetService.getUtilization(currentMonthStr)) {
            if (budget.getStatus().equals(BudgetConstants.STATUS_EXCEEDED)) {
                insights.add(InsightResponse.builder()
                        .type("ALERT")
                        .category(budget.getCategoryName())
                        .message(String.format("You exceeded your %s budget by %.1f%%",
                                budget.getCategoryName(),
                                budget.getUtilizationPercentage() - 100))
                        .build());
            } else if (budget.getStatus().equals(BudgetConstants.STATUS_WARNING)) {
                insights.add(InsightResponse.builder()
                        .type("WARNING")
                        .category(budget.getCategoryName())
                        .message(String.format("You've used %.1f%% of your %s budget",
                                budget.getUtilizationPercentage(),
                                budget.getCategoryName()))
                        .build());
            }
        }

        return insights;
    }

    private Map<String, BigDecimal> toCategoryMap(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[1], (BigDecimal) row[2]);
        }
        return map;
    }
}