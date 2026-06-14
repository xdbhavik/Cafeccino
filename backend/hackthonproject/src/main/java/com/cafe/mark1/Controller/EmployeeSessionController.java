package com.cafe.mark1.Controller;

import com.cafe.mark1.Dto.Request.EmployeeSessionRequest;
import com.cafe.mark1.Dto.Response.EmployeeSessionResponse;
import com.cafe.mark1.Service.EmployeeSessionService;
import com.cafe.mark1.model.SessionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class EmployeeSessionController {

    private final EmployeeSessionService sessionService;

    @PostMapping("/open")
    public ResponseEntity<EmployeeSessionResponse> openSession() {
        return ResponseEntity.ok(sessionService.openSession());
    }

    @PostMapping("/close")
    public ResponseEntity<EmployeeSessionResponse> closeSession(@RequestBody(required = false) EmployeeSessionRequest request) {
        BigDecimal manualAmount = (request != null) ? request.getClosingAmount() : null;
        return ResponseEntity.ok(sessionService.closeSession(manualAmount));
    }

    @GetMapping("/current")
    public ResponseEntity<EmployeeSessionResponse> getCurrentSession() {
        return ResponseEntity.ok(sessionService.getCurrentSession());
    }

    @GetMapping
    public ResponseEntity<List<EmployeeSessionResponse>> getAllSessions(
            @RequestParam(required = false) SessionStatus status,
            @RequestParam(required = false) Long employeeId) {
        
        if (employeeId != null) {
            return ResponseEntity.ok(sessionService.getEmployeeSessionHistory(employeeId));
        }
        if (status != null) {
            return ResponseEntity.ok(sessionService.getSessionsByStatus(status));
        }
        return ResponseEntity.ok(sessionService.getAllSessions());
    }
}