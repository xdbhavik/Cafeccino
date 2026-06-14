package com.cafe.mark1.Dto.Request;

import com.cafe.mark1.model.DiscountType;
import com.cafe.mark1.model.PromotionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    private String name;
    private String code; // Required if mode is ORDER
    private PromotionType type; // PRODUCT or ORDER
    private Long applicableProductId; // Required if type is PRODUCT
    private Integer minQty; // Required if type is PRODUCT (e.g., Buy 2)
    private DiscountType discountType; // PERCENT or FLAT
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount; // Minimum bill for ORDER type
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}