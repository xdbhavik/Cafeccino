package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.PromotionRequest;
import com.cafe.mark1.Dto.Response.PromotionResponse;
import com.cafe.mark1.Repository.ProductRepository;
import com.cafe.mark1.Repository.PromotionRepository;
import com.cafe.mark1.model.Product;
import com.cafe.mark1.model.Promotion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        Product product = null;
        if (request.getApplicableProductId() != null) {
            product = productRepository.findById(request.getApplicableProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
        }

        Promotion promotion = Promotion.builder()
                .name(request.getName())
                .code(request.getCode())
                .type(request.getType())
                .applicableProduct(product)
                .minQty(request.getMinQty())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDateTime.now())
                .endDate(request.getEndDate() != null ? request.getEndDate() : LocalDateTime.now().plusYears(1))
                .isActive(true)
                .build();

        return mapToResponse(promotionRepository.save(promotion));
    }

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    private PromotionResponse mapToResponse(Promotion p) {
        return PromotionResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .code(p.getCode())
                .type(p.getType())
                .applicableProductId(p.getApplicableProduct() != null ? p.getApplicableProduct().getId() : null)
                .productName(p.getApplicableProduct() != null ? p.getApplicableProduct().getName() : null)
                .minQty(p.getMinQty())
                .discountType(p.getDiscountType())
                .discountValue(p.getDiscountValue())
                .minOrderAmount(p.getMinOrderAmount())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .isActive(p.getIsActive())
                .build();
    }
}