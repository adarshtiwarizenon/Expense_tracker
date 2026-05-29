package com.example.expense_tracker.util;

import com.example.expense_tracker.entity.Transaction;
import com.opencsv.CSVWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class CsvExportUtil {

    public byte[] exportTransactionsToCsv(List<Transaction> transactions) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             PrintWriter pw = new PrintWriter(osw);
             CSVWriter csvWriter = new CSVWriter(pw)) {

            // Header row
            String[] header = {
                    "ID", "Date", "Type", "Category", "Amount",
                    "Description", "Payment Method"
            };
            csvWriter.writeNext(header);

            // Data rows
            for (Transaction tx : transactions) {
                String[] row = {
                        String.valueOf(tx.getId()),
                        tx.getDate().toString(),
                        tx.getType().toString(),
                        tx.getCategory().getName(),
                        tx.getAmount().toString(),
                        tx.getDescription() != null ? tx.getDescription() : "",
                        tx.getPaymentMethod() != null ? tx.getPaymentMethod() : ""
                };
                csvWriter.writeNext(row);
            }

            csvWriter.flush();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating CSV: ", e);
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }
}