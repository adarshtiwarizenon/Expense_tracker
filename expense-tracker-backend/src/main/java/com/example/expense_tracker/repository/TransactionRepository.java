package com.example.expense_tracker.repository;

import com.example.expense_tracker.entity.Transaction;
import com.example.expense_tracker.entity.enums.TransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends
        JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    long countByCategoryId(Long categoryId);

    // ====== Aggregate Queries ======

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumByUserAndType(@Param("userId") Long userId,
                                @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserAndTypeBetween(@Param("userId") Long userId,
                                       @Param("type") TransactionType type,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
            "AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserAndCategoryBetween(@Param("userId") Long userId,
                                           @Param("categoryId") Long categoryId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    // Recent 5 transactions
    List<Transaction> findTop5ByUserIdOrderByDateDescCreatedAtDesc(Long userId);

    // Category-wise breakdown (pie chart)
    @Query("SELECT t.category.id, t.category.name, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.date BETWEEN :startDate AND :endDate " +
            "GROUP BY t.category.id, t.category.name " +
            "ORDER BY SUM(t.amount) DESC")
    List<Object[]> findCategoryBreakdown(@Param("userId") Long userId,
                                         @Param("type") TransactionType type,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    // Monthly comparison (bar chart) - native because of DATE_TRUNC
    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('month', t.date), 'YYYY-MM') AS month, " +
            "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income, " +
            "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense " +
            "FROM transactions t " +
            "WHERE t.user_id = :userId AND t.date >= :startDate " +
            "GROUP BY DATE_TRUNC('month', t.date) " +
            "ORDER BY DATE_TRUNC('month', t.date) ASC",
            nativeQuery = true)
    List<Object[]> findMonthlyComparison(@Param("userId") Long userId,
                                         @Param("startDate") LocalDate startDate);

    // Expense trend by date (line chart)
    @Query("SELECT t.date, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
            "AND t.date BETWEEN :startDate AND :endDate " +
            "GROUP BY t.date " +
            "ORDER BY t.date ASC")
    List<Object[]> findExpenseTrend(@Param("userId") Long userId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);
}