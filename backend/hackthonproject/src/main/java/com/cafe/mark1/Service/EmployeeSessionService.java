package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.EmployeeSessionRequest;
import com.cafe.mark1.Dto.Response.EmployeeSessionResponse;
import com.cafe.mark1.Repository.EmployeeSessionRepository;
import com.cafe.mark1.Repository.UserRepository;
import com.cafe.mark1.model.EmployeeSession;
import com.cafe.mark1.model.SessionStatus;
import com.cafe.mark1.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeSessionService {

    private final EmployeeSessionRepository employeeSessionRepository;
    private final UserRepository userRepository;
    private final com.cafe.mark1.Repository.OrderRepository orderRepository;

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null || 
            "anonymousUser".equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
            // Fallback for testing without token
            return userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No users found in database for testing fallback."));
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElse(userRepository.findAll().stream().findFirst().orElse(null));
    }

    public EmployeeSessionResponse openSession() {
        User user = getCurrentUser();
        // 1. Pehle check karo agar already ek OPEN session exist karta hai
        return employeeSessionRepository.findByEmployeeIdAndStatus(user.getId(), SessionStatus.OPEN)
                .map(this::toDto) // Agar exist karta hai, wahi return karo
                .orElseGet(() -> {
                    // Agar nahi hai, toh naya banao
                    EmployeeSession session = EmployeeSession.builder()
                            .employee(user)
                            .openTime(LocalDateTime.now())
                            .closeTime(null)
                            .closingAmount(BigDecimal.ZERO)
                            .status(SessionStatus.OPEN)
                            .build();

                    return toDto(employeeSessionRepository.save(session));
                });
    }

    public EmployeeSessionResponse closeSession(BigDecimal manualClosingAmount) {
        User user = getCurrentUser();
        // 1. Check if user has an open session
        EmployeeSession session = employeeSessionRepository.findByEmployeeIdAndStatus(user.getId(), SessionStatus.OPEN)
                .orElseThrow(() -> new RuntimeException("No active session found for you to close."));

        // 3. closeTime = LocalDateTime.now()
        session.setCloseTime(LocalDateTime.now());
        
        // 4. closingAmount calculate karo
        if (manualClosingAmount != null) {
            // User ne manual amount bheja hai (Cash counting manually)
            session.setClosingAmount(manualClosingAmount);
        } else {
            // System se automatic calculate karo (Sum of PAID orders)
            BigDecimal systemAmount = orderRepository.calculateClosingAmount(session.getId());
            session.setClosingAmount(systemAmount != null ? systemAmount : BigDecimal.ZERO);
        }
        
        // 5. status = CLOSED
        session.setStatus(SessionStatus.CLOSED);

        // 6. Save, return DTO
        return toDto(employeeSessionRepository.save(session));
    }

    public EmployeeSessionResponse getCurrentSession() {
        User user = getCurrentUser();
        // POS frontend help: active session check karo
        Optional<EmployeeSession> openSession = employeeSessionRepository.findByEmployeeIdAndStatus(user.getId(), SessionStatus.OPEN);
        
        if (openSession.isPresent()) {
            return toDto(openSession.get());
        }

        // Agar OPEN nahi mila -> most recent CLOSED session return karo
        return employeeSessionRepository.findFirstByEmployeeIdOrderByCloseTimeDesc(user.getId())
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("No session history found for you."));
    }

    public List<EmployeeSessionResponse> getAllSessions() {
        return employeeSessionRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<EmployeeSessionResponse> getSessionsByStatus(SessionStatus status) {
        return employeeSessionRepository.findByStatus(status).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<EmployeeSessionResponse> getEmployeeSessionHistory(Long employeeId) {
        return employeeSessionRepository.findByEmployeeIdOrderByOpenTimeDesc(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private EmployeeSessionResponse toDto(EmployeeSession entity) {
        return EmployeeSessionResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getName())
                .openTime(entity.getOpenTime())
                .closeTime(entity.getCloseTime())
                .closingAmount(entity.getClosingAmount())
                .status(entity.getStatus())
                .build();
    }
}