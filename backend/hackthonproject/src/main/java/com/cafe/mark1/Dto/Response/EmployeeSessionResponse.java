package com.cafe.mark1.Dto.Response;

import com.cafe.mark1.model.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSessionResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDateTime openTime;
    private LocalDateTime closeTime;
    private BigDecimal closingAmount;
    private SessionStatus status;
}