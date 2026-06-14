package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.OrderRequest;
import com.cafe.mark1.Dto.Response.KitchenTicketResponse;
import com.cafe.mark1.Dto.Response.OrderLineResponse;
import com.cafe.mark1.Dto.Response.OrderResponse;
import com.cafe.mark1.Repository.*;
import com.cafe.mark1.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CafeTableRepository tableRepository;
    private final EmployeeSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final com.cafe.mark1.Repository.PromotionRepository promotionRepository;
    private final PaymentSettingsRepository paymentSettingsRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null || 
            "anonymousUser".equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
            // Fallback for testing without token
            return userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No users found in database for testing fallback."));
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElse(userRepository.findAll().stream().findFirst().orElse(null));
    }

    private EmployeeSession getCurrentSession() {
        User user = getCurrentUser();
        return sessionRepository.findByEmployeeIdAndStatus(user.getId(), SessionStatus.OPEN)
                .orElseThrow(() -> new RuntimeException("No active session found for employee: " + user.getName() + ". Please open a session first."));
    }

    private void validateOrderOwnership(Order order) {
        User currentUser = getCurrentUser();
        // Allow Admins to manage all orders, otherwise only the owner of the session/order
        if (currentUser.getRole() != Role.ADMIN && 
            !order.getSession().getEmployee().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to modify this order.");
        }
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        CafeTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found"));
        
        // Use authenticated session if not provided, or validate it belongs to auth user
        EmployeeSession session;
        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            // Optional: check if session belongs to auth user
            User currentUser = getCurrentUser();
            if (!session.getEmployee().getId().equals(currentUser.getId())) {
                throw new RuntimeException("This session does not belong to you.");
            }
        } else {
            session = getCurrentSession();
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            if (Boolean.TRUE.equals(customer.getIsArchived())) {
                throw new RuntimeException("Customer is archived");
            }
        }

        Order order = Order.builder()
                .table(table)
                .session(session)
                .customer(customer)
                .status(OrderStatus.DRAFT)
                .discount(BigDecimal.ZERO)
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();

        // Use request discount if provided
        if (request.getDiscount() != null) {
            order.setDiscount(request.getDiscount());
        }
        if (request.getCouponCode() != null) {
            order.setCouponCode(request.getCouponCode());
        }

        // Handle initial lines if provided in request
        if (request.getLines() != null && !request.getLines().isEmpty()) {
            for (OrderRequest.OrderLineRequest lineReq : request.getLines()) {
                Product product = productRepository.findById(lineReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + lineReq.getProductId()));
                
                OrderLine line = OrderLine.builder()
                        .order(order)
                        .product(product)
                        .qty(lineReq.getQty())
                        .unitPrice(BigDecimal.valueOf(product.getPrice()))
                        .lineDiscount(lineReq.getLineDiscount() != null ? lineReq.getLineDiscount() : BigDecimal.ZERO)
                        .lineTotal(BigDecimal.valueOf(product.getPrice() * lineReq.getQty()))
                        .build();
                order.addLine(line);
            }
        }

        // Update Table status
        table.setHasActiveOrder(true);
        tableRepository.save(table);

        recalculateOrder(order);
        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse addOrUpdateLine(Long orderId, Long productId, Integer qty, BigDecimal lineDiscount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        validateOrderOwnership(order);

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new RuntimeException("Cannot modify a " + order.getStatus() + " order");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if product already exists in lines
        OrderLine existingLine = order.getLines().stream()
                .filter(line -> line.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingLine != null) {
            if (qty <= 0) {
                order.getLines().remove(existingLine);
            } else {
                existingLine.setQty(qty);
                if (lineDiscount != null) {
                    existingLine.setLineDiscount(lineDiscount);
                }
                // Re-calculate line total
                existingLine.setLineTotal(
                    existingLine.getUnitPrice()
                        .multiply(BigDecimal.valueOf(qty))
                        .subtract(existingLine.getLineDiscount())
                );
            }
        } else if (qty > 0) {
            // New line
            OrderLine newLine = OrderLine.builder()
                    .order(order)
                    .product(product)
                    .qty(qty)
                    .unitPrice(BigDecimal.valueOf(product.getPrice()))
                    .lineDiscount(lineDiscount != null ? lineDiscount : BigDecimal.ZERO)
                    .lineTotal(BigDecimal.valueOf(product.getPrice() * qty).subtract(lineDiscount != null ? lineDiscount : BigDecimal.ZERO))
                    .build();
            order.addLine(newLine);
        }

        recalculateOrder(order);
        return mapToResponse(orderRepository.save(order));
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    public List<OrderResponse> getOrders(Long sessionId, String search) {
        List<Order> orders;
        User currentUser = getCurrentUser();

        if (sessionId != null) {
            orders = orderRepository.findBySessionId(sessionId);
            // Validate visibility
            if (currentUser.getRole() != Role.ADMIN && !orders.isEmpty()) {
                if (!orders.get(0).getSession().getEmployee().getId().equals(currentUser.getId())) {
                    throw new RuntimeException("You are not authorized to view these orders.");
                }
            }
        } else {
            if (currentUser.getRole() == Role.ADMIN) {
                orders = orderRepository.findAll();
            } else {
                // Return orders from all sessions of this employee? Or only open ones?
                // For now, return all orders by this employee
                orders = orderRepository.findAll().stream()
                        .filter(o -> o.getSession().getEmployee().getId().equals(currentUser.getId()))
                        .collect(Collectors.toList());
            }
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            orders = orders.stream()
                    .filter(o -> (o.getCustomer() != null && o.getCustomer().getName().toLowerCase().contains(lowerSearch)) ||
                                 o.getId().toString().contains(lowerSearch))
                    .collect(Collectors.toList());
        }

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse removeLine(Long orderId, Long lineId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        validateOrderOwnership(order);

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new RuntimeException("Cannot modify a " + order.getStatus() + " order");
        }

        order.getLines().removeIf(line -> line.getId().equals(lineId));

        recalculateOrder(order);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse applyCoupon(Long orderId, String couponCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        validateOrderOwnership(order);

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new RuntimeException("Coupons can only be applied to DRAFT orders");
        }

        // Validate coupon existence
        Promotion coupon = promotionRepository.findByCodeAndIsActiveTrue(couponCode)
                .orElseThrow(() -> new RuntimeException("Invalid or inactive coupon code"));

        order.setCouponCode(couponCode);
        recalculateOrder(order);
        
        return mapToResponse(orderRepository.save(order));
    }

    private void recalculateOrder(Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        // Fetch active product promotions
        List<Promotion> productPromos = promotionRepository.findCurrentActivePromotions(PromotionType.PRODUCT);

        for (OrderLine line : order.getLines()) {
            // 1. Line Gross Total
            BigDecimal lineGross = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQty()));
            line.setLineTotal(lineGross); 

            // 2. PRODUCT-type promotions (Auto-Apply)
            line.setLineDiscount(BigDecimal.ZERO); // Reset first
            for (Promotion promo : productPromos) {
                // Check if promo applies to this specific product and qty meets min requirement
                if (promo.getApplicableProduct() != null && 
                    promo.getApplicableProduct().getId().equals(line.getProduct().getId()) &&
                    line.getQty() >= (promo.getMinQty() != null ? promo.getMinQty() : 0)) {
                    
                    BigDecimal discount = BigDecimal.ZERO;
                    if (promo.getDiscountType() == DiscountType.PERCENT) {
                        discount = lineGross.multiply(promo.getDiscountValue()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
                    } else { // FIXED
                        // Fixed discount per unit or per line? Usually per line for these rules
                        discount = promo.getDiscountValue();
                    }
                    // Apply highest discount (simplified: applying the first match for now)
                    line.setLineDiscount(discount);
                }
            }

            // 3. Increment Subtotal: sum(lineTotal - lineDiscount)
            subtotal = subtotal.add(line.getLineTotal().subtract(line.getLineDiscount()));

            // 4. Tax calculation: sum per line (qty * unitPrice * product.tax / 100)
            BigDecimal lineTax = lineGross
                    .multiply(BigDecimal.valueOf(line.getProduct().getTax()))
                    .divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
            
            totalTax = totalTax.add(lineTax);
        }

        // 5. ORDER-type promotions (Auto-Apply)
        BigDecimal orderDiscount = BigDecimal.ZERO;
        List<Promotion> orderPromos = promotionRepository.findCurrentActivePromotions(PromotionType.ORDER);
        
        for (Promotion promo : orderPromos) {
            BigDecimal minAmount = promo.getMinOrderAmount() != null ? promo.getMinOrderAmount() : BigDecimal.ZERO;
            if (subtotal.compareTo(minAmount) >= 0) {
                if (promo.getDiscountType() == DiscountType.PERCENT) {
                    orderDiscount = orderDiscount.add(subtotal.multiply(promo.getDiscountValue()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP));
                } else {
                    orderDiscount = orderDiscount.add(promo.getDiscountValue());
                }
            }
        }

        // 5b. Manual Coupon Apply
        if (order.getCouponCode() != null && !order.getCouponCode().isEmpty()) {
            Promotion coupon = promotionRepository.findByCodeAndIsActiveTrue(order.getCouponCode())
                    .orElse(null);
            
            if (coupon != null) {
                // Check min order amount for coupon if applicable
                BigDecimal minAmount = coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount() : BigDecimal.ZERO;
                if (subtotal.compareTo(minAmount) >= 0) {
                    if (coupon.getDiscountType() == DiscountType.PERCENT) {
                        orderDiscount = orderDiscount.add(subtotal.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP));
                    } else {
                        orderDiscount = orderDiscount.add(coupon.getDiscountValue());
                    }
                }
            }
        }
        
        order.setDiscount(orderDiscount);

        // Update Order level fields
        order.setSubtotal(subtotal);
        order.setTax(totalTax);
        
        // 6. Final Total: total = subtotal + tax - orderDiscount
        BigDecimal total = subtotal.add(totalTax).subtract(order.getDiscount());
        order.setTotal(total.max(BigDecimal.ZERO)); 
    }

    @Transactional
    public OrderResponse markAsPaid(Long orderId, String paymentMethod) {
        return markAsPaid(orderId, paymentMethod, null, null);
    }

    @Transactional
    public OrderResponse markAsPaid(Long orderId, String paymentMethod, BigDecimal receivedAmount, String transactionRef) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        validateOrderOwnership(order);

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT orders can be paid. Current status: " + order.getStatus());
        }

        if (order.getLines().isEmpty()) {
            throw new RuntimeException("Cannot pay for an empty order (Cart is empty)");
        }

        String resolvedPaymentMethod = paymentMethod != null ? paymentMethod : "CASH";
        PaymentSettings paymentSettings = paymentSettingsRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Payment settings not found"));

        validatePaymentSettings(resolvedPaymentMethod, paymentSettings);
        applyPaymentDetails(order, resolvedPaymentMethod, receivedAmount, transactionRef, paymentSettings);

        order.setStatus(OrderStatus.PAID);
        order.setPaymentMethod(resolvedPaymentMethod);
        order.setPaidAt(LocalDateTime.now());
        
        CafeTable table = order.getTable();
        table.setHasActiveOrder(false);
        tableRepository.save(table);

        return mapToResponse(orderRepository.save(order));
    }

    private void validatePaymentSettings(String paymentMethod, PaymentSettings settings) {
        if ("CASH".equalsIgnoreCase(paymentMethod)) {
            if (!Boolean.TRUE.equals(settings.getCashEnabled())) {
                throw new RuntimeException("CASH payment is not enabled");
            }
            return;
        }

        if ("CARD".equalsIgnoreCase(paymentMethod)) {
            if (!Boolean.TRUE.equals(settings.getCardEnabled())) {
                throw new RuntimeException("CARD payment is not enabled");
            }
            return;
        }

        if ("UPI".equalsIgnoreCase(paymentMethod)) {
            if (!Boolean.TRUE.equals(settings.getUpiEnabled())) {
                throw new RuntimeException("UPI payment is not enabled");
            }
            if (settings.getUpiId() == null || settings.getUpiId().trim().isEmpty()) {
                throw new RuntimeException("UPI ID not configured");
            }
            return;
        }

        throw new RuntimeException("Unsupported payment method: " + paymentMethod);
    }

    private void applyPaymentDetails(
            Order order,
            String paymentMethod,
            BigDecimal receivedAmount,
            String transactionRef,
            PaymentSettings settings
    ) {
        if ("CASH".equalsIgnoreCase(paymentMethod)) {
            order.setReceivedAmount(receivedAmount);
            order.setChangeAmount(calculateChangeAmount(receivedAmount, order.getTotal()));
            order.setTransactionRef(null);
            return;
        }

        order.setReceivedAmount(null);
        order.setChangeAmount(null);

        if ("CARD".equalsIgnoreCase(paymentMethod)) {
            if (transactionRef == null || transactionRef.trim().isEmpty()) {
                throw new RuntimeException("Card payment requires transaction reference");
            }
            order.setTransactionRef(transactionRef);
            return;
        }

        order.setTransactionRef(null);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        validateOrderOwnership(order);

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Free the table if no more DRAFT orders exist
        CafeTable table = order.getTable();
        List<Order> activeOrders = orderRepository.findByTableIdAndStatus(table.getId(), OrderStatus.DRAFT);
        if (activeOrders.isEmpty()) {
            table.setHasActiveOrder(false);
            tableRepository.save(table);
        }

        return mapToResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getOrdersBySession(Long sessionId) {
        return orderRepository.findBySessionId(sessionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setSessionId(order.getSession().getId());
        response.setTableId(order.getTable().getId());
        response.setTableNumber(order.getTable().getTableNumber());
        response.setCustomerId(order.getCustomer() != null ? order.getCustomer().getId() : null);
        response.setCustomerName(order.getCustomer() != null ? order.getCustomer().getName() : "Guest");
        response.setCustomerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null);
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal());
        response.setTax(order.getTax());
        response.setDiscount(order.getDiscount());
        response.setTotal(order.getTotal());
        response.setCouponCode(order.getCouponCode());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setReceivedAmount(order.getReceivedAmount());
        response.setChangeAmount(order.getChangeAmount());
        response.setTransactionRef(order.getTransactionRef());
        response.setCreatedAt(order.getCreatedAt());
        response.setPaidAt(order.getPaidAt());
        response.setSentToKitchen(order.getSentToKitchen());
        
        response.setLines(order.getLines().stream().map(line -> {
            OrderLineResponse lineRes = new OrderLineResponse();
            lineRes.setId(line.getId());
            lineRes.setOrderId(order.getId());
            lineRes.setProductId(line.getProduct().getId());
            lineRes.setProductName(line.getProduct().getName());
            lineRes.setCategoryColorHex(line.getProduct().getCategory().getColorHex());
            lineRes.setQty(line.getQty());
            lineRes.setUnitPrice(line.getUnitPrice());
            lineRes.setLineTotal(line.getLineTotal());
            lineRes.setLineDiscount(line.getLineDiscount());
            lineRes.setStatus(line.getStatus().name());
            return lineRes;
        }).collect(Collectors.toList()));
        
        return response;
    }

    // ======================== KDS (Kitchen Display System) Methods ========================

    /**
     * KDS Initial Load — Returns all orders sent to kitchen that have
     * at least one active KDS line (PENDING/PREPPING/READY).
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getKdsActiveOrders() {
        return orderRepository.findKdsActiveOrders().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<KitchenTicketResponse> getActiveKitchenTickets() {
        return orderRepository.findKdsActiveOrders().stream()
                .map(this::mapToKitchenTicket)
                .collect(Collectors.toList());
    }

    /**
     * "Send to Kitchen" — Employee clicks this after finalizing an order.
     * Sets sentToKitchen = true, confirms all KDS-eligible lines are PENDING,
     * and broadcasts the update to /topic/kds.
     */
    @Transactional
    public OrderResponse sendToKitchen(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getSentToKitchen()) {
            throw new RuntimeException("Order #" + orderId + " is already sent to kitchen.");
        }

        if (order.getLines().isEmpty()) {
            throw new RuntimeException("Cannot send an empty order to kitchen.");
        }

        boolean hasKitchenItems = order.getLines().stream()
                .anyMatch(line -> Boolean.TRUE.equals(line.getProduct().getShowOnKDS()));
        if (!hasKitchenItems) {
            throw new RuntimeException("Order #" + orderId + " has no kitchen-display items.");
        }

        // Mark the order as sent to kitchen
        order.setSentToKitchen(true);

        // Ensure all KDS-eligible lines are in PENDING status
        for (OrderLine line : order.getLines()) {
            if (line.getProduct().getShowOnKDS() && line.getStatus() == LineStatus.CANCELLED) {
                // Re-activate cancelled KDS items when sending to kitchen
                line.setStatus(LineStatus.PENDING);
            }
        }

        OrderResponse response = mapToResponse(orderRepository.save(order));
        broadcastKds(mapToKitchenTicket(order));
        return response;
    }

    private BigDecimal calculateChangeAmount(BigDecimal receivedAmount, BigDecimal total) {
        if (receivedAmount == null) {
            throw new RuntimeException("Cash payment requires received amount");
        }

        BigDecimal change = receivedAmount.subtract(total);
        if (change.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Insufficient amount");
        }

        return change;
    }

    @Transactional
    public KitchenTicketResponse sendOrderToKitchenTicket(Long orderId) {
        sendToKitchen(orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToKitchenTicket(order);
    }

    /**
     * Item-level status update — Single line ka status update karo.
     * PENDING → PREPPING → READY → SERVED (forward transitions only).
     * Broadcasts the updated order to /topic/kds.
     */
    @Transactional
    public OrderResponse updateLineStatus(Long orderId, Long lineId, LineStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSentToKitchen()) {
            throw new RuntimeException("Order #" + orderId + " has not been sent to kitchen yet.");
        }

        OrderLine targetLine = order.getLines().stream()
                .filter(line -> line.getId().equals(lineId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order line #" + lineId + " not found in order #" + orderId));

        // Validate forward-only transition
        if (!isValidTransition(targetLine.getStatus(), newStatus)) {
            throw new RuntimeException("Invalid status transition: " + targetLine.getStatus() + " → " + newStatus);
        }

        targetLine.setStatus(newStatus);

        OrderResponse response = mapToResponse(orderRepository.save(order));
        broadcastKds(mapToKitchenTicket(order));
        return response;
    }

    @Transactional
    public KitchenTicketResponse updateKitchenLineStatus(Long orderId, Long lineId, LineStatus newStatus) {
        updateLineStatus(orderId, lineId, newStatus);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToKitchenTicket(order);
    }

    /**
     * Ticket-level advance — Saari eligible lines (showOnKDS=true) ka status
     * ek saath next stage mein advance karo.
     * Only advances lines that share the "lowest" current status.
     * Broadcasts the updated order to /topic/kds.
     */
    @Transactional
    public OrderResponse advanceOrderStage(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getSentToKitchen()) {
            throw new RuntimeException("Order #" + orderId + " has not been sent to kitchen yet.");
        }

        // Get all KDS-eligible lines that are not yet SERVED or CANCELLED
        List<OrderLine> kdsLines = order.getLines().stream()
                .filter(line -> line.getProduct().getShowOnKDS())
                .filter(line -> line.getStatus() != LineStatus.SERVED && line.getStatus() != LineStatus.CANCELLED)
                .collect(Collectors.toList());

        if (kdsLines.isEmpty()) {
            throw new RuntimeException("No active KDS lines to advance in order #" + orderId);
        }

        // Find the lowest status among eligible lines
        LineStatus lowestStatus = kdsLines.stream()
                .map(OrderLine::getStatus)
                .min((a, b) -> Integer.compare(a.ordinal(), b.ordinal()))
                .orElse(LineStatus.PENDING);

        LineStatus nextStatus = getNextStatus(lowestStatus);
        if (nextStatus == null) {
            throw new RuntimeException("All KDS lines are already at final stage.");
        }

        // Advance all lines that share the lowest status
        for (OrderLine line : kdsLines) {
            if (line.getStatus() == lowestStatus) {
                line.setStatus(nextStatus);
            }
        }

        OrderResponse response = mapToResponse(orderRepository.save(order));
        broadcastKds(mapToKitchenTicket(order));
        return response;
    }

    @Transactional
    public KitchenTicketResponse advanceKitchenTicketStage(Long orderId) {
        advanceOrderStage(orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToKitchenTicket(order);
    }

    // ======================== KDS Helper Methods ========================

    /**
     * Broadcast updated order to all connected KDS screens via WebSocket.
     */
    private void broadcastKds(KitchenTicketResponse ticketResponse) {
        messagingTemplate.convertAndSend("/topic/kds", ticketResponse);
        messagingTemplate.convertAndSend("/topic/kitchen-tickets", ticketResponse);
    }

    private KitchenTicketResponse mapToKitchenTicket(Order order) {
        List<KitchenTicketResponse.KitchenTicketItemResponse> items = order.getLines().stream()
                .filter(line -> Boolean.TRUE.equals(line.getProduct().getShowOnKDS()))
                .filter(line -> line.getStatus() != LineStatus.CANCELLED)
                .map(line -> KitchenTicketResponse.KitchenTicketItemResponse.builder()
                        .lineId(line.getId())
                        .productId(line.getProduct().getId())
                        .productName(line.getProduct().getName())
                        .categoryColorHex(line.getProduct().getCategory().getColorHex())
                        .qty(line.getQty())
                        .status(line.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        return KitchenTicketResponse.builder()
                .ticketId(order.getId())
                .orderId(order.getId())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : "Guest")
                .stage(resolveTicketStage(order))
                .totalItems(items.stream().mapToInt(KitchenTicketResponse.KitchenTicketItemResponse::getQty).sum())
                .items(items)
                .build();
    }

    private String resolveTicketStage(Order order) {
        return order.getLines().stream()
                .filter(line -> Boolean.TRUE.equals(line.getProduct().getShowOnKDS()))
                .filter(line -> line.getStatus() != LineStatus.CANCELLED)
                .map(OrderLine::getStatus)
                .min(Comparator.comparingInt(LineStatus::ordinal))
                .orElse(LineStatus.SERVED)
                .name();
    }

    /**
     * Returns the next status in the kitchen flow.
     * PENDING → PREPPING → READY → SERVED
     */
    private LineStatus getNextStatus(LineStatus current) {
        return switch (current) {
            case PENDING -> LineStatus.PREPPING;
            case PREPPING -> LineStatus.READY;
            case READY -> LineStatus.SERVED;
            default -> null; // SERVED and CANCELLED have no next stage
        };
    }

    /**
     * Validates that the status transition is forward-only.
     */
    private boolean isValidTransition(LineStatus from, LineStatus to) {
        // Allow CANCELLED from any active state
        if (to == LineStatus.CANCELLED) {
            return from != LineStatus.SERVED && from != LineStatus.CANCELLED;
        }
        // Forward-only: PENDING(0) → PREPPING(1) → READY(2) → SERVED(3)
        return to.ordinal() > from.ordinal() && to.ordinal() <= LineStatus.SERVED.ordinal();
    }
}
