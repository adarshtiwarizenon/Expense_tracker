package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.constants.BudgetConstants;
import com.example.expense_tracker.dto.request.BudgetRequest;
import com.example.expense_tracker.dto.response.BudgetResponse;
import com.example.expense_tracker.dto.response.BudgetUtilizationResponse;
import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.exception.BadRequestException;
import com.example.expense_tracker.exception.ResourceNotFoundException;
import com.example.expense_tracker.mapper.BudgetMapper;
import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.service.BudgetService;
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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetMapper budgetMapper;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgets() {
        Long userId = securityUtil.getCurrentUserId();
        return budgetRepository.findByUserId(userId).stream()
                .map(budgetMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        return budgetMapper.toResponse(budget);
    }

    @Override
    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User user = securityUtil.getCurrentUser();

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        if (budgetRepository.existsByUserIdAndCategoryIdAndMonth(
                user.getId(), category.getId(), request.getMonth())) {
            throw new BadRequestException("Budget already exists for this category and month");
        }

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .month(request.getMonth())
                .user(user)
                .category(category)
                .build();

        Budget saved = budgetRepository.save(budget);
        log.info("Budget created: {} for user: {}", saved.getId(), user.getId());
        return budgetMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setCategory(category);

        Budget updated = budgetRepository.save(budget);
        log.info("Budget updated: {} for user: {}", updated.getId(), userId);
        return budgetMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
        log.info("Budget deleted: {} for user: {}", id, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetUtilizationResponse> getUtilization(String month) {
        Long userId = securityUtil.getCurrentUserId();

        String targetMonth = (month != null && !month.isBlank())
                ? month
                : YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, targetMonth);

        YearMonth ym = YearMonth.parse(targetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        return budgets.stream()
                .map(budget -> calculateUtilization(budget, userId, startDate, endDate))
                .toList();
    }

    private BudgetUtilizationResponse calculateUtilization(
            Budget budget, Long userId, LocalDate startDate, LocalDate endDate) {

        BigDecimal spent = transactionRepository.sumByUserAndCategoryBetween(
                userId, budget.getCategory().getId(), startDate, endDate);

        BigDecimal remaining = budget.getAmount().subtract(spent);

        double percentage = 0.0;
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentage = spent.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getAmount(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        String status = determineStatus(percentage);

        return BudgetUtilizationResponse.builder()
                .budgetId(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .month(budget.getMonth())
                .budgetAmount(budget.getAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .utilizationPercentage(percentage)
                .status(status)
                .build();
    }

    private String determineStatus(double percentage) {
        if (percentage >= BudgetConstants.EXCEEDED_THRESHOLD) {
            return BudgetConstants.STATUS_EXCEEDED;
        } else if (percentage >= BudgetConstants.WARNING_THRESHOLD) {
            return BudgetConstants.STATUS_WARNING;
        }
        return BudgetConstants.STATUS_NORMAL;
    }
}