package com.cafe.mark1.Dto.Response;

import com.cafe.mark1.model.DiscountType;
import com.cafe.mark1.model.PromotionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PromotionResponse {
    private Long id;
    private String name;
    private String code;
    private PromotionType type;
    private Long applicableProductId;
    private String productName;
    private Integer minQty;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean isActive;
}