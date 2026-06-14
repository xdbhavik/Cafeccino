package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.CategoryRequest;
import com.cafe.mark1.Dto.Response.CategoryResponse;
import com.cafe.mark1.Repository.CategoryRepository;
import com.cafe.mark1.model.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return toDto(category);
    }

    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            throw new RuntimeException("Category already exists with name: " + categoryRequest.getName());
        }

        Category category = Category.builder()
                .name(categoryRequest.getName())
                .colorHex(categoryRequest.getColorHex())
                .build();

        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!category.getName().equals(categoryRequest.getName()) && 
            categoryRepository.existsByName(categoryRequest.getName())) {
            throw new RuntimeException("Category already exists with name: " + categoryRequest.getName());
        }

        category.setName(categoryRequest.getName());
        category.setColorHex(categoryRequest.getColorHex());

        Category updatedCategory = categoryRepository.save(category);
        return toDto(updatedCategory);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse toDto(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .colorHex(category.getColorHex())
                .build();
    }
}