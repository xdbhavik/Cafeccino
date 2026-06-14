package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.OrderRequest;
import com.cafe.mark1.Dto.Response.OrderResponse;
import com.cafe.mark1.Service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin("*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/lines")
    public ResponseEntity<OrderResponse> addOrUpdateLine(
            @PathVariable Long id,
            @RequestBody LineUpdateRequest request) {
        return ResponseEntity.ok(orderService.addOrUpdateLine(id, request.getProductId(), request.getQty(), request.getLineDiscount()));
    }

    @DeleteMapping("/{id}/lines/{lineId}")
    public ResponseEntity<OrderResponse> removeLine(
            @PathVariable Long id,
            @PathVariable Long lineId) {
        return ResponseEntity.ok(orderService.removeLine(id, lineId));
    }

    @PostMapping("/{id}/coupon")
    public ResponseEntity<OrderResponse> applyCoupon(
            @PathVariable Long id,
            @RequestBody CouponRequest request) {
        return ResponseEntity.ok(orderService.applyCoupon(id, request.getCode()));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<OrderResponse> markAsPaid(
            @PathVariable Long id,
            @RequestBody PayRequest request) {
        return ResponseEntity.ok(orderService.markAsPaid(
                id,
                request.getPaymentMethod(),
                request.getReceivedAmount(),
                request.getTransactionRef()
        ));
    }

    @PostMapping("/{id}/send-to-kitchen")
    public ResponseEntity<OrderResponse> sendToKitchen(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.sendToKitchen(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(orderService.getOrders(sessionId, search));
    }

    // DTOs for Request Bodies
    @lombok.Data
    public static class LineUpdateRequest {
        private Long productId;
        private Integer qty;
        private java.math.BigDecimal lineDiscount;
    }

    @lombok.Data
    public static class CouponRequest {
        private String code;
    }

    @lombok.Data
    public static class PayRequest {
        private String paymentMethod;
        private java.math.BigDecimal receivedAmount;
        private String transactionRef;
    }
}
