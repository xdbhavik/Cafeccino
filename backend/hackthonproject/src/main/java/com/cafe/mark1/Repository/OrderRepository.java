package com.cafe.mark1.Repository;

import com.cafe.mark1.model.Order;
import com.cafe.mark1.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findBySessionId(Long sessionId);
    List<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);
    List<Order> findBySessionIdAndStatus(Long sessionId, OrderStatus status);
    List<Order> findByStatusAndPaidAtBetween(OrderStatus status, LocalDateTime from, LocalDateTime to);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.session.id = :sessionId AND o.status = 'PAID'")
    BigDecimal calculateClosingAmount(@Param("sessionId") Long sessionId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.lines l " +
           "WHERE o.sentToKitchen = true " +
           "AND l.status IN ('PENDING', 'PREPPING', 'READY') " +
           "AND l.product.showOnKDS = true")
    List<Order> findKdsActiveOrders();
}
