package com.cafe.mark1.Controller;

import com.cafe.mark1.Service.PaymentQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentQrController {

    private final PaymentQrService paymentQrService;

    @GetMapping(value = "/orders/{orderId}/upi-qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateUpiQr(@PathVariable Long orderId) {
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(paymentQrService.generateUpiQrForOrder(orderId));
    }
}
