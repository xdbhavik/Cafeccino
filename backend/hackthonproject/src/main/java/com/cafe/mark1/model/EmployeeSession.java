package com.cafe.mark1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Column(nullable = false)
    private LocalDateTime openTime;

    private LocalDateTime closeTime;

    private BigDecimal closingAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;
}