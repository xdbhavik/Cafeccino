package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.PaymentSettingsRequest;
import com.cafe.mark1.Dto.Response.PaymentSettingsResponse;
import com.cafe.mark1.Repository.PaymentSettingsRepository;
import com.cafe.mark1.model.PaymentSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentSettingsService {

    private static final Long SETTINGS_ID = 1L;

    private final PaymentSettingsRepository paymentSettingsRepository;

    public PaymentSettingsResponse getPaymentSettings() {
        return toDto(getOrCreateSettings());
    }

    public PaymentSettingsResponse updatePaymentSettings(PaymentSettingsRequest request) {
        PaymentSettings settings = getOrCreateSettings();
        settings.setCashEnabled(request.getCash());
        settings.setCardEnabled(request.getCard());
        settings.setUpiEnabled(request.getUpi());
        settings.setUpiId(request.getUpiId());

        return toDto(paymentSettingsRepository.save(settings));
    }

    private PaymentSettings getOrCreateSettings() {
        return paymentSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> paymentSettingsRepository.save(PaymentSettings.builder()
                        .id(SETTINGS_ID)
                        .cashEnabled(true)
                        .cardEnabled(true)
                        .upiEnabled(true)
                        .upiId("")
                        .build()));
    }

    private PaymentSettingsResponse toDto(PaymentSettings settings) {
        return PaymentSettingsResponse.builder()
                .cash(Boolean.TRUE.equals(settings.getCashEnabled()))
                .card(Boolean.TRUE.equals(settings.getCardEnabled()))
                .upi(Boolean.TRUE.equals(settings.getUpiEnabled()))
                .upiId(settings.getUpiId())
                .build();
    }
}
