package com.cafe.mark1.Dto.Request;

import com.cafe.mark1.model.Role;
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
public class UpdateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Role is required")
    private Role role;
}
