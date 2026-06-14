package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Response.DashboardSummaryResponse;
import com.cafe.mark1.Dto.Response.OrderResponse;
import com.cafe.mark1.Dto.Response.ProductReportResponse;
import com.cafe.mark1.Dto.Response.SalesReportResponse;
import com.cafe.mark1.Dto.Response.SalesTrendResponse;
import com.cafe.mark1.Dto.Response.SessionReportResponse;
import com.cafe.mark1.Dto.Response.TopProductResponse;
import com.cafe.mark1.Repository.CafeTableRepository;
import com.cafe.mark1.Repository.EmployeeSessionRepository;
import com.cafe.mark1.Repository.OrderRepository;
import com.cafe.mark1.model.EmployeeSession;
import com.cafe.mark1.model.Order;
import com.cafe.mark1.model.OrderLine;
import com.cafe.mark1.model.OrderStatus;
import com.cafe.mark1.model.SessionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final CafeTableRepository tableRepository;
    private final EmployeeSessionRepository sessionRepository;
    private final OrderService orderService;

    public DashboardSummaryResponse getDashboardSummary(LocalDate from, LocalDate to) {
        List<Order> orders = getPaidOrders(from, to);
        BigDecimal totalSales = sum(orders.stream().map(Order::getTotal).toList());
        long totalOrders = orders.size();

        return DashboardSummaryResponse.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .averageOrderValue(totalOrders == 0
                        ? BigDecimal.ZERO
                        : totalSales.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP))
                .cashSales(sumByPayment(orders, "CASH"))
                .cardSales(sumByPayment(orders, "CARD"))
                .upiSales(sumByPayment(orders, "UPI"))
                .activeTables(tableRepository.countByHasActiveOrderTrue())
                .openSessions(sessionRepository.countByStatus(SessionStatus.OPEN))
                .build();
    }

    public List<SalesTrendResponse> getSalesTrend(LocalDate from, LocalDate to) {
        Map<LocalDate, List<Order>> byDate = getPaidOrders(from, to).stream()
                .filter(order -> order.getPaidAt() != null)
                .collect(Collectors.groupingBy(order -> order.getPaidAt().toLocalDate(), LinkedHashMap::new, Collectors.toList()));

        return byDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> SalesTrendResponse.builder()
                        .date(entry.getKey())
                        .sales(sum(entry.getValue().stream().map(Order::getTotal).toList()))
                        .orders((long) entry.getValue().size())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TopProductResponse> getTopProducts(LocalDate from, LocalDate to, int limit) {
        Map<Long, ProductAccumulator> products = new HashMap<>();

        for (Order order : getPaidOrders(from, to)) {
            for (OrderLine line : order.getLines()) {
                ProductAccumulator accumulator = products.computeIfAbsent(line.getProduct().getId(), id ->
                        new ProductAccumulator(line.getProduct().getId(), line.getProduct().getName(), null));
                accumulator.quantitySold += line.getQty();
                accumulator.revenue = accumulator.revenue.add(netLineRevenue(line));
            }
        }

        return products.values().stream()
                .sorted(Comparator.comparing(ProductAccumulator::getRevenue).reversed())
                .limit(limit)
                .map(accumulator -> TopProductResponse.builder()
                        .productId(accumulator.productId)
                        .productName(accumulator.productName)
                        .quantitySold(accumulator.quantitySold)
                        .revenue(accumulator.revenue)
                        .build())
                .collect(Collectors.toList());
    }

    public SalesReportResponse getSalesReport(LocalDate from, LocalDate to) {
        List<Order> orders = getPaidOrders(from, to);
        BigDecimal totalSales = sum(orders.stream().map(Order::getTotal).toList());
        BigDecimal totalTax = sum(orders.stream().map(Order::getTax).toList());
        BigDecimal totalDiscount = sum(orders.stream().map(Order::getDiscount).toList());

        Map<String, BigDecimal> paymentBreakdown = new LinkedHashMap<>();
        paymentBreakdown.put("cash", sumByPayment(orders, "CASH"));
        paymentBreakdown.put("card", sumByPayment(orders, "CARD"));
        paymentBreakdown.put("upi", sumByPayment(orders, "UPI"));

        return SalesReportResponse.builder()
                .totalSales(totalSales)
                .totalTax(totalTax)
                .totalDiscount(totalDiscount)
                .netSales(totalSales.subtract(totalTax))
                .orders((long) orders.size())
                .paymentBreakdown(paymentBreakdown)
                .build();
    }

    public List<OrderResponse> getOrderReport(LocalDate from, LocalDate to) {
        return getPaidOrders(from, to).stream()
                .map(order -> orderService.getOrderById(order.getId()))
                .collect(Collectors.toList());
    }

    public List<ProductReportResponse> getProductReport(LocalDate from, LocalDate to) {
        Map<Long, ProductAccumulator> products = new HashMap<>();

        for (Order order : getPaidOrders(from, to)) {
            for (OrderLine line : order.getLines()) {
                ProductAccumulator accumulator = products.computeIfAbsent(line.getProduct().getId(), id ->
                        new ProductAccumulator(
                                line.getProduct().getId(),
                                line.getProduct().getName(),
                                line.getProduct().getCategory().getName()
                        ));
                accumulator.quantitySold += line.getQty();
                accumulator.grossRevenue = accumulator.grossRevenue.add(nullToZero(line.getLineTotal()));
                accumulator.discount = accumulator.discount.add(nullToZero(line.getLineDiscount()));
                accumulator.revenue = accumulator.revenue.add(netLineRevenue(line));
            }
        }

        return products.values().stream()
                .sorted(Comparator.comparing(ProductAccumulator::getRevenue).reversed())
                .map(accumulator -> ProductReportResponse.builder()
                        .productId(accumulator.productId)
                        .productName(accumulator.productName)
                        .categoryName(accumulator.categoryName)
                        .quantitySold(accumulator.quantitySold)
                        .grossRevenue(accumulator.grossRevenue)
                        .discount(accumulator.discount)
                        .netRevenue(accumulator.revenue)
                        .build())
                .collect(Collectors.toList());
    }

    public List<SessionReportResponse> getSessionReport(LocalDate from, LocalDate to) {
        LocalDateTime start = startOf(from);
        LocalDateTime end = endOf(to);
        List<EmployeeSession> sessions = sessionRepository.findByOpenTimeBetween(start, end);

        return sessions.stream()
                .map(session -> {
                    List<Order> sessionOrders = orderRepository.findBySessionIdAndStatus(session.getId(), OrderStatus.PAID);
                    return SessionReportResponse.builder()
                            .sessionId(session.getId())
                            .employeeId(session.getEmployee().getId())
                            .employeeName(session.getEmployee().getName())
                            .openTime(session.getOpenTime())
                            .closeTime(session.getCloseTime())
                            .status(session.getStatus())
                            .closingAmount(session.getClosingAmount())
                            .sales(sum(sessionOrders.stream().map(Order::getTotal).toList()))
                            .orders((long) sessionOrders.size())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<Order> getPaidOrders(LocalDate from, LocalDate to) {
        return orderRepository.findByStatusAndPaidAtBetween(OrderStatus.PAID, startOf(from), endOf(to));
    }

    private LocalDateTime startOf(LocalDate date) {
        return date.atStartOfDay();
    }

    private LocalDateTime endOf(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    private BigDecimal sumByPayment(List<Order> orders, String paymentMethod) {
        return sum(orders.stream()
                .filter(order -> paymentMethod.equalsIgnoreCase(order.getPaymentMethod()))
                .map(Order::getTotal)
                .toList());
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return values.stream()
                .map(this::nullToZero)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal netLineRevenue(OrderLine line) {
        return nullToZero(line.getLineTotal()).subtract(nullToZero(line.getLineDiscount()));
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private static class ProductAccumulator {
        private final Long productId;
        private final String productName;
        private final String categoryName;
        private long quantitySold;
        private BigDecimal grossRevenue = BigDecimal.ZERO;
        private BigDecimal discount = BigDecimal.ZERO;
        private BigDecimal revenue = BigDecimal.ZERO;

        private ProductAccumulator(Long productId, String productName, String categoryName) {
            this.productId = productId;
            this.productName = productName;
            this.categoryName = categoryName;
        }

        private BigDecimal getRevenue() {
            return revenue;
        }
    }
}
