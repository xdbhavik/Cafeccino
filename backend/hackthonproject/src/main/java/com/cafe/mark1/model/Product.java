package com.cafe.mark1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String uom; // Unit of Measure (e.g., kg, pcs)

    @Column(nullable = false)
    private Double tax;

    private String description;

    @Column(nullable = false)
    private Boolean showOnKDS; // Kitchen Display System

    private String imagePath;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}