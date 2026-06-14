package com.cafe.mark1.Dto.Request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSettingsRequest {

    @NotNull(message = "Cash setting is required")
    private Boolean cash;

    @NotNull(message = "Card setting is required")
    private Boolean card;

    @NotNull(message = "UPI setting is required")
    private Boolean upi;

    private String upiId;
}
