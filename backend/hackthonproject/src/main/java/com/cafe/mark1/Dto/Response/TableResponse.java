package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private String tableNumber;
    private Integer seats;
    private Boolean isActive;
    private Boolean hasActiveOrder;
    private Long floorId;
    private String floorName;
}