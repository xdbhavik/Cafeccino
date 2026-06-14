package com.cafe.mark1.Repository;

import com.cafe.mark1.model.Promotion;
import com.cafe.mark1.model.PromotionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    List<Promotion> findByTypeAndIsActiveTrue(PromotionType type);

    java.util.Optional<Promotion> findByCodeAndIsActiveTrue(String code);
    
    // Find active promotions within date range
    default List<Promotion> findCurrentActivePromotions(PromotionType type) {
        LocalDateTime now = LocalDateTime.now();
        return findByTypeAndIsActiveTrue(type).stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .toList();
    }
}