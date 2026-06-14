package com.cafe.mark1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String code; // Manual coupons ke liye

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    private Integer minQty; // Only for PRODUCT type

    private BigDecimal minOrderAmount; // Only for ORDER type

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicable_product_id")
    private Product applicableProduct;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}