package com.cafe.mark1.Dto.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableRequest {
    @NotBlank(message = "Table number is required")
    private String tableNumber;

    @NotNull(message = "Seats is required")
    @Min(value = 1, message = "Seats must be at least 1")
    private Integer seats;

    @NotNull(message = "Floor ID is required")
    private Long floorId;

    private Boolean isActive;
    private Boolean hasActiveOrder;
}