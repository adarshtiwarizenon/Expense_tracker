package com.example.expense_tracker.controller;

import com.example.expense_tracker.entity.enums.TransactionType;
import com.example.expense_tracker.exception.BadRequestException;
import com.example.expense_tracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTransactions(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) List<Long> categoryIds) {

        byte[] fileBytes;
        String contentType;
        String filename;

        if ("pdf".equalsIgnoreCase(format)) {
            fileBytes = reportService.exportTransactionsPdf(startDate, endDate, type, categoryIds);
            contentType = MediaType.APPLICATION_PDF_VALUE;
            filename = "transactions-" + LocalDate.now() + ".pdf";
        } else if ("csv".equalsIgnoreCase(format)) {
            fileBytes = reportService.exportTransactionsCsv(startDate, endDate, type, categoryIds);
            contentType = "text/csv";
            filename = "transactions-" + LocalDate.now() + ".csv";
        } else {
            throw new BadRequestException("Format must be 'csv' or 'pdf'");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(fileBytes.length);

        return ResponseEntity.ok().headers(headers).body(fileBytes);
    }
}