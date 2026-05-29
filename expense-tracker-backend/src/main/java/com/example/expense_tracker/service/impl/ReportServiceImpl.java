package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.entity.Transaction;
import com.example.expense_tracker.entity.enums.TransactionType;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.repository.TransactionSpecification;
import com.example.expense_tracker.service.ReportService;
import com.example.expense_tracker.util.CsvExportUtil;
import com.example.expense_tracker.util.PdfExportUtil;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CsvExportUtil csvExportUtil;
    private final PdfExportUtil pdfExportUtil;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public byte[] exportTransactionsCsv(LocalDate startDate, LocalDate endDate, TransactionType type, List<Long> categoryIds) {
        List<Transaction> transactions = fetchTransactions(startDate, endDate, type, categoryIds);
        log.info("Exporting {} transactions to CSV", transactions.size());
        return csvExportUtil.exportTransactionsToCsv(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportTransactionsPdf(LocalDate startDate, LocalDate endDate, TransactionType type, List<Long> categoryIds) {
        List<Transaction> transactions = fetchTransactions(startDate, endDate, type, categoryIds);
        log.info("Exporting {} transactions to PDF", transactions.size());

        String categoryNames = null;
        if (categoryIds != null && !categoryIds.isEmpty()) {
            categoryNames = categoryRepository.findAllById(categoryIds).stream()
                    .map(c -> c.getName())
                    .collect(java.util.stream.Collectors.joining(", "));
        }

        return pdfExportUtil.exportTransactionsToPdf(transactions, startDate, endDate, type, categoryNames);
    }

    private List<Transaction> fetchTransactions(LocalDate startDate, LocalDate endDate,
                                                TransactionType type, List<Long> categoryIds) {
        Long userId = securityUtil.getCurrentUserId();

        Specification<Transaction> spec = TransactionSpecification.withFilters(
                userId, type, categoryIds, startDate, endDate);

        return transactionRepository.findAll(spec, Sort.by("date").descending());
    }
}