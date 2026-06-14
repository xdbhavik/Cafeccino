package com.cafe.mark1.Repository;

import com.cafe.mark1.model.PaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentSettingsRepository extends JpaRepository<PaymentSettings, Long> {
}
