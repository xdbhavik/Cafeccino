package com.cafe.mark1.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "Customer name is required")
    private String name;

    @NotBlank(message = "Customer phone is required")
    private String phone;

    private String email;

    private String address;
}
