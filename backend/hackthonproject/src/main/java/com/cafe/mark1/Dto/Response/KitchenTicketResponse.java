package com.cafe.mark1.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicketResponse {
    private Long ticketId;
    private Long orderId;
    private Long tableId;
    private String tableNumber;
    private String customerName;
    private String stage;
    private Integer totalItems;
    private List<KitchenTicketItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KitchenTicketItemResponse {
        private Long lineId;
        private Long productId;
        private String productName;
        private String categoryColorHex;
        private Integer qty;
        private String status;
    }
}
