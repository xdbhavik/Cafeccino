package com.cafe.mark1.Repository;

import com.cafe.mark1.model.LineStatus;
import com.cafe.mark1.model.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {
    List<OrderLine> findByStatusInOrderByOrder_IdAsc(List<LineStatus> statuses);
}