package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSettingsResponse {
    private Boolean cash;
    private Boolean card;
    private Boolean upi;
    private String upiId;
}
