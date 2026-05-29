package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.dto.request.TransactionRequest;
import com.example.expense_tracker.dto.response.PageResponse;
import com.example.expense_tracker.dto.response.TransactionResponse;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.Transaction;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.entity.enums.TransactionType;
import com.example.expense_tracker.exception.ResourceNotFoundException;
import com.example.expense_tracker.mapper.TransactionMapper;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.repository.TransactionSpecification;
import com.example.expense_tracker.service.TransactionService;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getAllTransactions(
            int page, int size, String sortBy, String sortDir,
            TransactionType type, List<Long> categoryIds,
            LocalDate startDate, LocalDate endDate) {

        Long userId = securityUtil.getCurrentUserId();

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Transaction> spec = TransactionSpecification.withFilters(
                userId, type, categoryIds, startDate, endDate);

        Page<Transaction> transactionPage = transactionRepository.findAll(spec, pageable);

        Page<TransactionResponse> responsePage = transactionPage.map(transactionMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = securityUtil.getCurrentUser();

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate())
                .description(request.getDescription())
                .paymentMethod(request.getPaymentMethod())
                .category(category)
                .user(user)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created: {} for user: {}", saved.getId(), user.getId());
        return transactionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        Long userId = securityUtil.getCurrentUserId();

        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setCategory(category);

        Transaction updated = transactionRepository.save(transaction);
        log.info("Transaction updated: {} for user: {}", updated.getId(), userId);
        return transactionMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        transactionRepository.delete(transaction);
        log.info("Transaction deleted: {} for user: {}", id, userId);
    }
}