package com.cafe.mark1.Repository;

import com.cafe.mark1.model.EmployeeSession;
import com.cafe.mark1.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface EmployeeSessionRepository extends JpaRepository<EmployeeSession, Long> {
    Optional<EmployeeSession> findByEmployeeIdAndStatus(Long employeeId, SessionStatus status);
    List<EmployeeSession> findByStatus(SessionStatus status);
    Optional<EmployeeSession> findFirstByEmployeeIdOrderByCloseTimeDesc(Long employeeId);
    List<EmployeeSession> findByEmployeeIdOrderByOpenTimeDesc(Long employeeId);
    long countByStatus(SessionStatus status);
    List<EmployeeSession> findByOpenTimeBetween(LocalDateTime from, LocalDateTime to);
}
