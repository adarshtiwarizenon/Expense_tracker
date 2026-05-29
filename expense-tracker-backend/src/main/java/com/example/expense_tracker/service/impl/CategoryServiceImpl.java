package com.example.expense_tracker.service.impl;

import com.example.expense_tracker.dto.request.CategoryRequest;
import com.example.expense_tracker.dto.response.CategoryResponse;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.entity.enums.CategoryType;
import com.example.expense_tracker.exception.BadRequestException;
import com.example.expense_tracker.exception.ResourceNotFoundException;
import com.example.expense_tracker.mapper.CategoryMapper;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.TransactionRepository;
import com.example.expense_tracker.service.CategoryService;
import com.example.expense_tracker.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryMapper categoryMapper;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        Long userId = securityUtil.getCurrentUserId();
        return categoryRepository.findByUserId(userId).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        User user = securityUtil.getCurrentUser();

        if (categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: {} for user: {}", saved.getName(), user.getId());
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Only check duplicate if name is being changed
        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        category.setName(request.getName());
        category.setType(request.getType());

        Category updated = categoryRepository.save(category);
        log.info("Category updated: {} for user: {}", updated.getId(), userId);
        return categoryMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Long userId = securityUtil.getCurrentUserId();
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Prevent deletion if transactions exist
        long transactionCount = transactionRepository.countByCategoryId(id);
        if (transactionCount > 0) {
            throw new BadRequestException(
                    "Cannot delete category. It has " + transactionCount + " linked transaction(s).");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {} for user: {}", id, userId);
    }

    @Override
    @Transactional
    public void seedDefaultCategories(User user) {
        log.info("Seeding default categories for user: {}", user.getId());

        List<Category> defaults = List.of(
                // Expense categories
                buildCategory("Food", CategoryType.EXPENSE, user),
                buildCategory("Rent", CategoryType.EXPENSE, user),
                buildCategory("Bills", CategoryType.EXPENSE, user),
                buildCategory("Travel", CategoryType.EXPENSE, user),
                buildCategory("Shopping", CategoryType.EXPENSE, user),
                buildCategory("Entertainment", CategoryType.EXPENSE, user),
                // Income categories
                buildCategory("Salary", CategoryType.INCOME, user),
                buildCategory("Freelance", CategoryType.INCOME, user),
                buildCategory("Investment", CategoryType.INCOME, user),
                buildCategory("Bonus", CategoryType.INCOME, user)
        );

        categoryRepository.saveAll(defaults);
        log.info("Seeded {} default categories for user: {}", defaults.size(), user.getId());
    }

    private Category buildCategory(String name, CategoryType type, User user) {
        return Category.builder()
                .name(name)
                .type(type)
                .user(user)
                .build();
    }
}