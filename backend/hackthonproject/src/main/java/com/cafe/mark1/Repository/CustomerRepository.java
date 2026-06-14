package com.cafe.mark1.Repository;

import com.cafe.mark1.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Query("SELECT c FROM Customer c " +
           "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR c.phone LIKE CONCAT('%', :search, '%') " +
           "OR LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Customer> searchCustomers(@Param("search") String search);
}
