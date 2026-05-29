package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.dto.request.RecurringTransactionRequest;
import com.example.expense_tracker.dto.response.RecurringTransactionResponse;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.RecurringTransaction;
import com.example.expense_tracker.entity.Transaction;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.entity.enums.Frequency;
import com.example.expense_tracker.exception.ResourceNotFoundException;
import com.example.expense_tracker.mapper.RecurringTransactionMapper;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.RecurringTransactionRepository;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.service.RecurringTransactionService;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionMapper mapper;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> getAll() {
        Long userId = securityUtil.getCurrentUserId();
        return recurringRepository.findByUserId(userId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RecurringTransactionResponse getById(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recurring transaction not found with id: " + id));
        return mapper.toResponse(recurring);
    }

    @Override
    @Transactional
    public RecurringTransactionResponse create(RecurringTransactionRequest request) {
        User user = securityUtil.getCurrentUser();

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        RecurringTransaction recurring = RecurringTransaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .frequency(request.getFrequency())
                .nextExecution(request.getNextExecution())
                .description(request.getDescription())
                .user(user)
                .category(category)
                .build();

        RecurringTransaction saved = recurringRepository.save(recurring);
        log.info("Recurring transaction created: {} for user: {}", saved.getId(), user.getId());
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RecurringTransactionResponse update(Long id, RecurringTransactionRequest request) {
        Long userId = securityUtil.getCurrentUserId();

        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recurring transaction not found with id: " + id));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        recurring.setAmount(request.getAmount());
        recurring.setType(request.getType());
        recurring.setFrequency(request.getFrequency());
        recurring.setNextExecution(request.getNextExecution());
        recurring.setDescription(request.getDescription());
        recurring.setCategory(category);

        RecurringTransaction updated = recurringRepository.save(recurring);
        log.info("Recurring transaction updated: {} for user: {}", updated.getId(), userId);
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recurring transaction not found with id: " + id));
        recurringRepository.delete(recurring);
        log.info("Recurring transaction deleted: {} for user: {}", id, userId);
    }

    @Override
    @Transactional
    public int processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueList = recurringRepository.findByNextExecutionLessThanEqual(today);

        log.info("Processing {} due recurring transactions", dueList.size());
        int count = 0;

        for (RecurringTransaction recurring : dueList) {
            try {
                // Create the actual transaction
                Transaction transaction = Transaction.builder()
                        .amount(recurring.getAmount())
                        .type(recurring.getType())
                        .date(recurring.getNextExecution())
                        .description("[Auto] " + (recurring.getDescription() != null ? recurring.getDescription() : ""))
                        .paymentMethod("Auto-Generated")
                        .user(recurring.getUser())
                        .category(recurring.getCategory())
                        .build();
                transactionRepository.save(transaction);

                // Update next execution date based on frequency
                LocalDate nextDate = calculateNextExecution(
                        recurring.getNextExecution(), recurring.getFrequency());
                recurring.setNextExecution(nextDate);
                recurringRepository.save(recurring);

                count++;
                log.info("Auto-created transaction from recurring id: {}", recurring.getId());
            } catch (Exception e) {
                log.error("Failed to process recurring transaction id: {} - {}",
                        recurring.getId(), e.getMessage());
                // Continue processing others (one failure shouldn't stop batch)
            }
        }

        log.info("Successfully processed {} recurring transactions", count);
        return count;
    }

    private LocalDate calculateNextExecution(LocalDate current, Frequency frequency) {
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
        };
    }
}