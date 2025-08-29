package com.global.hr.Repo;

import java.util.List;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;

import com.global.hr.Entity.AttendanceEvent;
import com.global.hr.Entity.Registration;

public interface AttendanceEventRepo extends JpaRepository<AttendanceEvent, Long> {
    List<AttendanceEvent> findByRegistrationOrderByCreatedAtAsc(Registration registration);

    // optional: find last event
    AttendanceEvent findFirstByRegistrationOrderByCreatedAtDesc(Registration registration);

}
