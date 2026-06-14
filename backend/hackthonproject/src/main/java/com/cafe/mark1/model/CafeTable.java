package com.cafe.mark1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cafe_tables")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CafeTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tableNumber;

    @Column(nullable = false)
    private Integer seats;

    @Column(name = "`isActive`", nullable = false)
    private Boolean isActive;

    @Column(name = "`hasActiveOrder`", nullable = false)
    private Boolean hasActiveOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;
}
