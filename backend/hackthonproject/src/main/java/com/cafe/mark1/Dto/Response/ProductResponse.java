package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    
    // Flattened Category Fields
    private Long categoryId;
    private String categoryName;
    private String categoryColorHex;
    
    private Double price;
    private String uom;
    private Double tax;
    private String description;
    private Boolean showOnKDS;
    private String imagePath;
    private Boolean isActive;
}