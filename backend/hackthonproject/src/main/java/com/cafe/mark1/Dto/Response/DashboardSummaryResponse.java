package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private BigDecimal totalSales;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private BigDecimal cashSales;
    private BigDecimal cardSales;
    private BigDecimal upiSales;
    private Long activeTables;
    private Long openSessions;
}
