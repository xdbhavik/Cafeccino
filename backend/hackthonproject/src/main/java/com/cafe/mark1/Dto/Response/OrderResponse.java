package com.cafe.mark1.Dto.Response;

import com.cafe.mark1.model.OrderStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private Long sessionId;
    private Long tableId;
    private String tableNumber; // flat
    private Long customerId;
    private String customerName; // flat
    private String customerPhone;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private String couponCode;
    private String paymentMethod;
    private BigDecimal receivedAmount;
    private BigDecimal changeAmount;
    private String transactionRef;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private Boolean sentToKitchen;
    private List<OrderLineResponse> lines;
}
