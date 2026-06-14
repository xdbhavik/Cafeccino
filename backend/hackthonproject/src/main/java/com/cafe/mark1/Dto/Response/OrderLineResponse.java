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
public class OrderLineResponse {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String categoryColorHex;
    private Integer qty;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private BigDecimal lineDiscount;
    private String status;
}