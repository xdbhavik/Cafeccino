package com.cafe.mark1.Repository;

import com.cafe.mark1.model.CafeTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CafeTableRepository extends JpaRepository<CafeTable, Long> {
    boolean existsByTableNumber(String tableNumber);
    List<CafeTable> findByFloorId(Long floorId);
    long countByHasActiveOrderTrue();
}
