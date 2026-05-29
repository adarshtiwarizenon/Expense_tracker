package com.example.expense_tracker.mapper;

import com.example.expense_tracker.dto.response.CategoryResponse;
import com.example.expense_tracker.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .build();
    }
}