package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Response.PaymentSettingsResponse;
import com.cafe.mark1.Repository.OrderRepository;
import com.cafe.mark1.model.Order;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PaymentQrService {

    private final OrderRepository orderRepository;
    private final PaymentSettingsService paymentSettingsService;

    public byte[] generateUpiQrForOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentSettingsResponse settings = paymentSettingsService.getPaymentSettings();
        if (!Boolean.TRUE.equals(settings.getUpi())) {
            throw new RuntimeException("UPI payment is not enabled");
        }

        if (settings.getUpiId() == null || settings.getUpiId().trim().isEmpty()) {
            throw new RuntimeException("UPI ID not configured");
        }

        String amount = order.getTotal().setScale(2, RoundingMode.HALF_UP).toPlainString();
        String payload = "upi://pay"
                + "?pa=" + encode(settings.getUpiId().trim())
                + "&pn=" + encode("CafeChino")
                + "&am=" + encode(amount)
                + "&cu=INR"
                + "&tn=" + encode("Order " + order.getId());

        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(payload, BarcodeFormat.QR_CODE, 320, 320);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate UPI QR code", e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
