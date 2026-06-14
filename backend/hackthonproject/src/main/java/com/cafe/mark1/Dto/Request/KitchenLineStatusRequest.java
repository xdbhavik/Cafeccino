package com.cafe.mark1.Dto.Request;

import com.cafe.mark1.model.LineStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenLineStatusRequest {

    @NotNull(message = "Status is required")
    private LineStatus status;
}
