package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.KitchenLineStatusRequest;
import com.cafe.mark1.Dto.Response.KitchenTicketResponse;
import com.cafe.mark1.Service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen-tickets")
@RequiredArgsConstructor
@CrossOrigin("*")
public class KitchenTicketController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<KitchenTicketResponse>> getActiveTickets() {
        return ResponseEntity.ok(orderService.getActiveKitchenTickets());
    }

    @PostMapping("/orders/{orderId}/send")
    public ResponseEntity<KitchenTicketResponse> sendToKitchen(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.sendOrderToKitchenTicket(orderId));
    }

    @PatchMapping("/{orderId}/lines/{lineId}/status")
    public ResponseEntity<KitchenTicketResponse> updateLineStatus(
            @PathVariable Long orderId,
            @PathVariable Long lineId,
            @Valid @RequestBody KitchenLineStatusRequest request
    ) {
        return ResponseEntity.ok(orderService.updateKitchenLineStatus(orderId, lineId, request.getStatus()));
    }

    @PatchMapping("/{orderId}/advance")
    public ResponseEntity<KitchenTicketResponse> advanceTicketStage(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.advanceKitchenTicketStage(orderId));
    }
}
