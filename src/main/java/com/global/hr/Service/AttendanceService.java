package com.global.hr.Service;

import java.time.Instant;
import java.util.List;
import jakarta.persistence.LockModeType;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.global.hr.DTO.AttendanceDtoResponse;
import com.global.hr.DTO.BulkCheckoutResponse;
import com.global.hr.DTO.EventAttendeeResponse;
import com.global.hr.DTO.AttendeeDashboardStatsResponse;
import com.global.hr.DTO.RecentActivityResponse;
import com.global.hr.Entity.AttendanceEvent;
import com.global.hr.Entity.AttendanceEventType;
import com.global.hr.Entity.Event;
import com.global.hr.Entity.Registration;
import com.global.hr.Entity.RegistrationStatus;
import com.global.hr.Entity.User;
import com.global.hr.Repo.AttendanceEventRepo;
import com.global.hr.Repo.RegistrationRepo;
import com.global.hr.Repo.EventRepo;
import com.global.hr.Repo.UserRepo;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {
	private final RegistrationRepo registrationRepo;
    private final AttendanceEventRepo eventRepo;
    private final EventRepo eventRepository;
    private final UserRepo userRepository;

    public AttendanceService(RegistrationRepo registrationRepo,
                             AttendanceEventRepo eventRepo, EventRepo eventRepository, UserRepo userRepository) {
        this.registrationRepo = registrationRepo;
        this.eventRepo = eventRepo;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
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
        
        // if still active (CHECKIN or RESUME was the last action), count until now
        if (activeStart != null) {
            long currentSessionSeconds = Duration.between(activeStart, Instant.now()).getSeconds();
            totalSeconds += currentSessionSeconds;
            
            // Debug logging
            System.out.println("Registration " + reg.getCode() + " is currently active:");
            System.out.println("  Active since: " + activeStart);
            System.out.println("  Current session: " + currentSessionSeconds + " seconds");
            System.out.println("  Total accumulated: " + totalSeconds + " seconds");
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
        // Debug logging
        System.out.println("Computing credit hours for " + totalSeconds + " seconds");
        
        // For debugging, let's show the actual time even if it's less than 15 minutes
        double hours = totalSeconds / 3600.0;   // convert seconds → hours
        
        if (totalSeconds < 15 * 60) {
            System.out.println("  Less than 15 minutes, but returning actual hours for debugging: " + hours);
            return hours; // Return actual hours for debugging instead of 0.0
        }
        
        double roundedHours = Math.round(hours * 4.0) / 4.0;   // round to nearest 0.25 hr (15 mins)
        
        System.out.println("  Raw hours: " + hours);
        System.out.println("  Rounded hours: " + roundedHours);
        
        return roundedHours;
    }


    @Transactional
    public BulkCheckoutResponse checkoutAllAttendeesForEvent(Long eventId) {
        // Find the event
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        
        // Get all registrations for this event
        List<Registration> registrations = registrationRepo.findByEvent(event);
        
        int processedCount = 0;
        int alreadyCheckedOutCount = 0;
        
        for (Registration registration : registrations) {
            // Check the last attendance event for this registration
            AttendanceEvent lastEvent = eventRepo.findFirstByRegistrationOrderByCreatedAtDesc(registration);
            
            // If there's no event or the last event is not CHECKOUT, create a checkout event
            if (lastEvent == null || lastEvent.getEventType() != AttendanceEventType.CHECKOUT) {
                AttendanceEvent checkoutEvent = new AttendanceEvent();
                checkoutEvent.setRegistration(registration);
                checkoutEvent.setEventType(AttendanceEventType.CHECKOUT);
                checkoutEvent.setMeta("{\"admin_bulk_checkout\": true}");
                eventRepo.save(checkoutEvent);
                processedCount++;
            } else {
                alreadyCheckedOutCount++;
            }
        }
        
        return new BulkCheckoutResponse(
            eventId, 
            registrations.size(), 
            processedCount, 
            alreadyCheckedOutCount
        );
    }

    @Transactional(readOnly = true)
    public List<EventAttendeeResponse> getEventAttendees(Long eventId) {
        // Find the event
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        
        // Get all registrations for this event
        List<Registration> registrations = registrationRepo.findByEvent(event);
        
        return registrations.stream()
            .map(reg -> {
                // Get the last attendance event for this registration
                AttendanceEvent lastEvent = eventRepo.findFirstByRegistrationOrderByCreatedAtDesc(reg);
                
                // Calculate total active time
                Duration totalActive = computeTotalActiveTimeForRegistration(reg);
                double creditHours = computeCreditHours(totalActive.getSeconds());
                
                // Debug logging for this registration
                System.out.println("Registration " + reg.getCode() + " (" + reg.getUser().getName() + "):");
                System.out.println("  Total active duration: " + totalActive);
                System.out.println("  Credit hours: " + creditHours);
                
                // Determine current status and last action
                String currentStatus = "REGISTERED";
                String lastAction = "NONE";
                Instant lastActivity = reg.getCreatedAt();
                
                if (lastEvent != null) {
                    lastActivity = lastEvent.getCreatedAt();
                    lastAction = lastEvent.getEventType().toString();
                    
                    switch (lastEvent.getEventType()) {
                        case CHECKIN:
                        case RESUME:
                            currentStatus = "ACTIVE";
                            break;
                        case PAUSE:
                            currentStatus = "PAUSED";
                            break;
                        case CHECKOUT:
                            currentStatus = "CHECKED_OUT";
                            break;
                        default:
                            currentStatus = "REGISTERED";
                    }
                }
                
                return new EventAttendeeResponse(
                    reg.getId(),
                    reg.getUser().getId(),
                    reg.getUser().getName(),
                    reg.getUser().getEmail(),
                    reg.getCode(),
                    currentStatus,
                    lastActivity,
                    creditHours,
                    lastAction
                );
            })
            .toList();
    }

    /**
     * Get dashboard statistics for a specific user
     */
    @Transactional(readOnly = true)
    public AttendeeDashboardStatsResponse getUserDashboardStats(String userEmail) {
        // Find user by email
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        
        // Get all registrations for this user
        List<Registration> userRegistrations = registrationRepo.findByUser(user);
        
        // Calculate upcoming events (events that haven't started yet)
        int upcomingEvents = 0;
        double totalAttendanceHours = 0.0;
        int qrScans = 0;
        int eventsAttended = 0;
        
        // Get current time as LocalDateTime for comparison
        LocalDateTime now = LocalDateTime.now();
        
        for (Registration registration : userRegistrations) {
            Event event = registration.getEvent();
            
            // Check if event is upcoming (hasn't started yet)
            if (event.getEventStartTime().isAfter(now)) {
                upcomingEvents++;
            }
            
            // Check if event is completed (has ended)
            if (event.getEventEndTime().isBefore(now)) {
                eventsAttended++;
            }
            
            // Calculate total attendance hours for this registration
            Duration totalActive = computeTotalActiveTimeForRegistration(registration);
            totalAttendanceHours += computeCreditHours(totalActive.getSeconds());
            
            // Count QR scans (CHECKIN events)
            List<AttendanceEvent> attendanceEvents = eventRepo.findByRegistrationOrderByCreatedAtAsc(registration);
            for (AttendanceEvent attendanceEvent : attendanceEvents) {
                if (attendanceEvent.getEventType() == AttendanceEventType.CHECKIN) {
                    qrScans++;
                }
            }
        }
        
        // Get recent activity for this user
        List<RecentActivityResponse> recentActivity = getUserRecentActivity(user);
        
        return new AttendeeDashboardStatsResponse(
            upcomingEvents,
            totalAttendanceHours,
            qrScans,
            eventsAttended,
            recentActivity
        );
    }

    /**
     * Get recent activity for a specific user
     */
    @Transactional(readOnly = true)
    private List<RecentActivityResponse> getUserRecentActivity(User user) {
        List<RecentActivityResponse> activities = new ArrayList<>();
        
        // Get all registrations for this user
        List<Registration> userRegistrations = registrationRepo.findByUser(user);
        
        for (Registration registration : userRegistrations) {
            Event event = registration.getEvent();
            
            // Get all attendance events for this registration, ordered by most recent
            List<AttendanceEvent> attendanceEvents = eventRepo.findByRegistrationOrderByCreatedAtAsc(registration);
            
            // Convert attendance events to activity items
            for (AttendanceEvent attendanceEvent : attendanceEvents) {
                String activityType = getActivityTypeDescription(attendanceEvent.getEventType());
                String status = getStatusDescription(attendanceEvent.getEventType());
                
                activities.add(new RecentActivityResponse(
                    activityType,
                    event.getEventName(),
                    attendanceEvent.getCreatedAt(),
                    status
                ));
            }
        }
        
        // Sort by timestamp (most recent first) and take only the last 5 activities
        return activities.stream()
            .sorted(Comparator.comparing(RecentActivityResponse::getTimestamp).reversed())
            .limit(5)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert attendance event type to human-readable description
     */
    private String getActivityTypeDescription(AttendanceEventType eventType) {
        switch (eventType) {
            case CHECKIN:
                return "Checked in to";
            case CHECKOUT:
                return "Completed";
            case PAUSE:
                return "Paused attendance at";
            case RESUME:
                return "Resumed attendance at";
            default:
                return "Updated status for";
        }
    }
    
    /**
     * Convert attendance event type to status description
     */
    private String getStatusDescription(AttendanceEventType eventType) {
        switch (eventType) {
            case CHECKIN:
                return "Active";
            case CHECKOUT:
                return "Completed";
            case PAUSE:
                return "Paused";
            case RESUME:
                return "Active";
            default:
                return "Updated";
        }
    }
}
