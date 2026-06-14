package com.cafe.mark1.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @NotBlank(message = "UOM is required")
    private String uom;

    @NotNull(message = "Tax is required")
    private Double tax;

    private String description;

    @NotNull(message = "showOnKDS status is required")
    private Boolean showOnKDS;

    private String imagePath;

    private Boolean isActive;
}