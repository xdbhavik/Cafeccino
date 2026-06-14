package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReportResponse {
    private Long productId;
    private String productName;
    private String categoryName;
    private Long quantitySold;
    private BigDecimal grossRevenue;
    private BigDecimal discount;
    private BigDecimal netRevenue;
}
