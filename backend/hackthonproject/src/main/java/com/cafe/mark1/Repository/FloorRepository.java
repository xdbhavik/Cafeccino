package com.cafe.mark1.Repository;

import com.cafe.mark1.model.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    boolean existsByName(String name);
}