package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.request.CategoryRequest;
import com.example.expense_tracker.dto.response.CategoryResponse;
import com.example.expense_tracker.entity.User;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    void seedDefaultCategories(User user);
}