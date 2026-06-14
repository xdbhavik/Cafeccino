package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.PaymentSettingsRequest;
import com.cafe.mark1.Dto.Response.PaymentSettingsResponse;
import com.cafe.mark1.Service.PaymentSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/payment-methods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentSettingsController {

    private final PaymentSettingsService paymentSettingsService;

    @GetMapping
    public ResponseEntity<PaymentSettingsResponse> getPaymentSettings() {
        return ResponseEntity.ok(paymentSettingsService.getPaymentSettings());
    }

    @PutMapping
    public ResponseEntity<PaymentSettingsResponse> updatePaymentSettings(
            @Valid @RequestBody PaymentSettingsRequest paymentSettingsRequest
    ) {
        return ResponseEntity.ok(paymentSettingsService.updatePaymentSettings(paymentSettingsRequest));
    }
}
