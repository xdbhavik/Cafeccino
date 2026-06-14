package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Response.OrderResponse;
import com.cafe.mark1.Dto.Response.ProductReportResponse;
import com.cafe.mark1.Dto.Response.SalesReportResponse;
import com.cafe.mark1.Dto.Response.SessionReportResponse;
import com.cafe.mark1.Service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ReportsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/sales")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getSalesReport(from, to));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrderReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getOrderReport(from, to));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductReportResponse>> getProductReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getProductReport(from, to));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionReportResponse>> getSessionReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getSessionReport(from, to));
    }
}
