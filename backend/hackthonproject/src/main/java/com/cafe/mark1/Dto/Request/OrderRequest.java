package com.cafe.mark1.Dto.Request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private Long tableId;
    private Long sessionId;
    private Long customerId;
    private String couponCode;
    private BigDecimal discount;
    private List<OrderLineRequest> lines;

    @Data
    public static class OrderLineRequest {
        private Long productId;
        private Integer qty;
        private BigDecimal unitPrice;
        private BigDecimal lineDiscount;
    }
}