package com.cafe.mark1.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSettings {

    @Id
    private Long id;

    @Column(nullable = false)
    private Boolean cashEnabled;

    @Column(nullable = false)
    private Boolean cardEnabled;

    @Column(nullable = false)
    private Boolean upiEnabled;

    private String upiId;
}
