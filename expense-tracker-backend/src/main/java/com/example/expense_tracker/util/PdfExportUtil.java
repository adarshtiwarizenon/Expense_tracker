package com.example.expense_tracker.util;

import com.example.expense_tracker.entity.Transaction;
import com.example.expense_tracker.entity.enums.TransactionType;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
public class PdfExportUtil {

    public byte[] exportTransactionsToPdf(List<Transaction> transactions,
                                          LocalDate startDate, LocalDate endDate,
                                          TransactionType type, String categoryName) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            document.add(new Paragraph("Finances - Transaction Report")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Filters summary
            StringBuilder filterLine = new StringBuilder();
            if (startDate != null && endDate != null) {
                filterLine.append("Date: ").append(startDate).append(" to ").append(endDate);
            } else if (startDate != null) {
                filterLine.append("Date: from ").append(startDate);
            } else if (endDate != null) {
                filterLine.append("Date: up to ").append(endDate);
            }
            if (type != null) {
                if (filterLine.length() > 0) filterLine.append("  |  ");
                filterLine.append("Type: ").append(type.name());
            }
            if (categoryName != null) {
                if (filterLine.length() > 0) filterLine.append("  |  ");
                filterLine.append("Category: ").append(categoryName);
            }
            String range = filterLine.length() > 0 ? filterLine.toString() : "All Transactions";
            document.add(new Paragraph(range)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.add(new Paragraph("\n"));

            // Summary Section
            BigDecimal totalIncome = transactions.stream()
                    .filter(t -> t.getType().name().equals("INCOME"))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalExpenses = transactions.stream()
                    .filter(t -> t.getType().name().equals("EXPENSE"))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal netBalance = totalIncome.subtract(totalExpenses);

            Table summary = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
            summary.addCell(createKeyCell("Total Transactions:"));
            summary.addCell(createValueCell(String.valueOf(transactions.size())));
            summary.addCell(createKeyCell("Total Income:"));
            summary.addCell(createValueCell("Rs. " + totalIncome));
            summary.addCell(createKeyCell("Total Expenses:"));
            summary.addCell(createValueCell("Rs. " + totalExpenses));
            summary.addCell(createKeyCell("Net Balance:"));
            summary.addCell(createValueCell("Rs. " + netBalance));
            document.add(summary);

            document.add(new Paragraph("\n"));

            // Transactions Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{15, 12, 20, 15, 28, 10}))
                    .useAllAvailableWidth();

            // Headers
            String[] headers = {"Date", "Type", "Category", "Amount", "Description", "Method"};
            for (String h : headers) {
                table.addHeaderCell(createHeaderCell(h));
            }

            // Rows
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            for (Transaction tx : transactions) {
                table.addCell(createBodyCell(tx.getDate().format(dateFormatter)));
                table.addCell(createBodyCell(tx.getType().toString()));
                table.addCell(createBodyCell(tx.getCategory().getName()));
                table.addCell(createBodyCell("Rs. " + tx.getAmount()));
                table.addCell(createBodyCell(tx.getDescription() != null ? tx.getDescription() : "-"));
                table.addCell(createBodyCell(tx.getPaymentMethod() != null ? tx.getPaymentMethod() : "-"));
            }

            document.add(table);

            //Footer
            document.add(new Paragraph("\nGenerated on: " + LocalDate.now())
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setItalic());

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF: ", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(new DeviceRgb(63, 81, 181))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);
    }

    private Cell createBodyCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setFontSize(9))
                .setPadding(4);
    }

    private Cell createKeyCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
    }

    private Cell createValueCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
    }
}