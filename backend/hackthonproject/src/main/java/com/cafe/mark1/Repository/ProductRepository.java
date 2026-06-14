package com.cafe.mark1.Repository;

import com.cafe.mark1.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // POS category filter tabs
    List<Product> findByCategoryId(Long categoryId);
    
    // Search bar
    List<Product> findByNameContainingIgnoreCase(String name);

    Optional<Product> findByNameIgnoreCase(String name);
    
    // Combined filter (Category + Search)
    List<Product> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String name);
}
