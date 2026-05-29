package com.example.expense_tracker.scheduler;

import com.example.expense_tracker.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringTransactionScheduler {

    private final RecurringTransactionService recurringTransactionService;

    /**
     * Runs every day at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void processRecurringTransactions() {
        log.info("=== Starting daily recurring transactions processing ===");
        try {
            int processed = recurringTransactionService.processDueRecurringTransactions();
            log.info("=== Completed: {} transactions auto-created ===", processed);
        } catch (Exception e) {
            log.error("Error in scheduled recurring transactions task: ", e);
        }
    }

    // @Scheduled(fixedRate = 300000)
    public void testScheduler() {
        log.info("Test scheduler running every 5 minutes");
    }
}