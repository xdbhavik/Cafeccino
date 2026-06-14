package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.ProductRequest;
import com.cafe.mark1.Dto.Response.ProductResponse;
import com.cafe.mark1.Repository.CategoryRepository;
import com.cafe.mark1.Repository.ProductRepository;
import com.cafe.mark1.model.Category;
import com.cafe.mark1.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<ProductResponse> getAllProducts(Long categoryId, String search) {
        List<Product> products;

        if (categoryId != null && search != null && !search.trim().isEmpty()) {
            products = productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, search);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search);
        } else {
            products = productRepository.findAll();
        }

        return products.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toDto(product);
    }

    public ProductResponse createProduct(ProductRequest dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + dto.getCategoryId()));

        Product product = Product.builder()
                .name(dto.getName())
                .category(category)
                .price(dto.getPrice())
                .uom(dto.getUom())
                .tax(dto.getTax())
                .description(dto.getDescription())
                .showOnKDS(dto.getShowOnKDS())
                .imagePath(dto.getImagePath())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        Product savedProduct = productRepository.save(product);
        return toDto(savedProduct);
    }

    public ProductResponse updateProduct(Long id, ProductRequest dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + dto.getCategoryId()));

        product.setName(dto.getName());
        product.setCategory(category);
        product.setPrice(dto.getPrice());
        product.setUom(dto.getUom());
        product.setTax(dto.getTax());
        product.setDescription(dto.getDescription());
        product.setShowOnKDS(dto.getShowOnKDS());
        product.setImagePath(dto.getImagePath());
        if (dto.getIsActive() != null) {
            product.setIsActive(dto.getIsActive());
        }

        Product updatedProduct = productRepository.save(product);
        return toDto(updatedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    private ProductResponse toDto(Product entity) {
        return ProductResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .categoryId(entity.getCategory().getId())
                .categoryName(entity.getCategory().getName())
                .categoryColorHex(entity.getCategory().getColorHex())
                .price(entity.getPrice())
                .uom(entity.getUom())
                .tax(entity.getTax())
                .description(entity.getDescription())
                .showOnKDS(entity.getShowOnKDS())
                .imagePath(entity.getImagePath())
                .isActive(entity.getIsActive())
                .build();
    }
}