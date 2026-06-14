package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportResponse {
    private BigDecimal totalSales;
    private BigDecimal totalTax;
    private BigDecimal totalDiscount;
    private BigDecimal netSales;
    private Long orders;
    private Map<String, BigDecimal> paymentBreakdown;
}
