package com.global.hr.Service;

import java.time.Instant;
import java.util.List;
import jakarta.persistence.LockModeType;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.global.hr.DTO.AttendanceDtoResponse;
import com.global.hr.Entity.AttendanceEvent;
import com.global.hr.Entity.AttendanceEventType;
import com.global.hr.Entity.Registration;
import com.global.hr.Entity.RegistrationStatus;
import com.global.hr.Repo.AttendanceEventRepo;
import com.global.hr.Repo.RegistrationRepo;

import java.time.Duration;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {
	private final RegistrationRepo registrationRepo;
    private final AttendanceEventRepo eventRepo;

    public AttendanceService(RegistrationRepo registrationRepo,
                             AttendanceEventRepo eventRepo) {
        this.registrationRepo = registrationRepo;
        this.eventRepo = eventRepo;
    }
    @Transactional
    public AttendanceDtoResponse handleScanByCode(String code, String action, String idempotencyKey) {
        // load registration by code, with pessimistic lock to avoid race conditions:
        Registration reg = registrationRepo.findByCodeForUpdate(code)
            .orElseThrow(() -> new IllegalArgumentException("Invalid code"));

        // Simple dedup/idempotency: check last event's meta for idempotencyKey
        AttendanceEvent last = eventRepo.findFirstByRegistrationOrderByCreatedAtDesc(reg);

        // decide eventType
        AttendanceEventType newType = decideNextEventType(reg, last, action);

        // optionally check idempotency: if last != null and last.eventType == newType and last.meta == idempotencyKey --> return
        if (last != null  && idempotencyKey != null ) {
            // already applied
        	String lastKey = null;
            try {
                // Parse JSON in last.getMeta() to extract the idempotency value
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(last.getMeta());
                lastKey = root.path("idempotency").asText(null);
            } catch (Exception e) {
                // if parsing fails, ignore and lastKey stays null
            }

            if (idempotencyKey.equals(lastKey)) {
                // already applied → return existing result
                Duration total = computeTotalActiveTimeForRegistration(reg);
                double creditHours = computeCreditHours(total.getSeconds());
                return new AttendanceDtoResponse(creditHours, reg.getId(), last.getEventType());
            }
        }

        // create new event
        AttendanceEvent ev = new AttendanceEvent();
        ev.setRegistration(reg);
        ev.setEventType(newType);
        ev.setMeta(idempotencyKey == null ? null : "{\"idempotency\":\"" + idempotencyKey + "\"}");
        eventRepo.save(ev);

//        // optionally update registration.status (redundant since we can compute from events, but useful)
//        reg.setStatus(statusFromEventsAfter(reg));
//        registrationRepo.save(reg);

        Duration totalActive = computeTotalActiveTimeForRegistration(reg);
        double creditHours = computeCreditHours(totalActive.getSeconds());
        return new AttendanceDtoResponse(creditHours, reg.getId(), ev.getEventType());
    }
    private AttendanceEventType decideNextEventType(Registration reg, AttendanceEvent last, String action) {
        if (action != null) {
            try {
                return AttendanceEventType.valueOf(action);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid action: " + action);
            }
        }
        // toggle logic:
        if (last == null) return AttendanceEventType.CHECKIN;
        switch (last.getEventType()) {
            case CHECKIN: case RESUME: return AttendanceEventType.PAUSE;
            case PAUSE: return AttendanceEventType.RESUME;
            case CHECKOUT: return AttendanceEventType.CHECKIN; // re-checkin allowed
            default: return AttendanceEventType.CHECKIN;
        }
    }
    @Transactional(readOnly = true)
    public Duration computeTotalActiveTimeForRegistration(Registration reg) {
        List<AttendanceEvent> events = eventRepo.findByRegistrationOrderByCreatedAtAsc(reg);
        Instant activeStart = null;
        long totalSeconds = 0L;
        for (AttendanceEvent ev : events) {
            switch (ev.getEventType()) {
                case CHECKIN:
                case RESUME:
                    if (activeStart == null) activeStart = ev.getCreatedAt();
                    break;
                case PAUSE:
                case CHECKOUT:
                case MANUAL:
                    if (activeStart != null) {
                        totalSeconds += Duration.between(activeStart, ev.getCreatedAt()).getSeconds();
                        activeStart = null;
                    }
                    break;
            }
        }
        // if still active, count until now
        if (activeStart != null) {
            totalSeconds += Duration.between(activeStart, Instant.now()).getSeconds();
        }
        return Duration.ofSeconds(totalSeconds);
    }
    private RegistrationStatus statusFromEventsAfter(Registration reg) {
        AttendanceEvent last = eventRepo.findFirstByRegistrationOrderByCreatedAtDesc(reg);
        if (last == null) return RegistrationStatus.REGISTERED;
        switch (last.getEventType()) {
            case CHECKIN: case RESUME: return RegistrationStatus.CHECKED_IN;
            case PAUSE: return RegistrationStatus.PAUSED;
            case CHECKOUT: return RegistrationStatus.CHECKED_OUT;
            default: return RegistrationStatus.REGISTERED;
        }
    }
    public double computeCreditHours(long totalSeconds) {
        if (totalSeconds < 15 * 60) return 0.0; // less than 15 minutes → 0 credit
        double hours = totalSeconds / 3600.0;   // convert seconds → hours
        return Math.round(hours * 4.0) / 4.0;   // round to nearest 0.25 hr (15 mins)
    }


}
