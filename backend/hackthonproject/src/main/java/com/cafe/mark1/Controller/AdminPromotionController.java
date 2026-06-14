package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.PromotionRequest;
import com.cafe.mark1.Dto.Response.PromotionResponse;
import com.cafe.mark1.Repository.PromotionRepository;
import com.cafe.mark1.Service.PromotionService;
import com.cafe.mark1.model.DiscountType;
import com.cafe.mark1.model.Promotion;
import com.cafe.mark1.model.PromotionType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionRepository promotionRepository;
    private final PromotionService promotionService;

    // Isse admin naya coupon ya offer bana sakta hai
    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@RequestBody PromotionRequest request) {
        return ResponseEntity.ok(promotionService.createPromotion(request));
    }

    // Sare offers dekhne ke liye
    @GetMapping
    public ResponseEntity<List<PromotionResponse>> getAll() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/seed-coupon")
    public ResponseEntity<String> seedCoupon() {
        if (promotionRepository.findByCodeAndIsActiveTrue("WELCOME10").isPresent()) {
            return ResponseEntity.ok("Coupon WELCOME10 already exists!");
        }

        Promotion coupon = Promotion.builder()
                .name("Welcome Discount")
                .code("WELCOME10")
                .type(PromotionType.ORDER)
                .discountType(DiscountType.PERCENT)
                .discountValue(new BigDecimal("10"))
                .minOrderAmount(new BigDecimal("100"))
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusMonths(1))
                .isActive(true)
                .build();

        promotionRepository.save(coupon);
        return ResponseEntity.ok("Coupon WELCOME10 created successfully! (10% off on orders above 100)");
    }
}