package com.global.hr.Service;

import com.global.hr.DTO.AttendeeExportResponse;
import com.global.hr.Entity.*;
import com.global.hr.Repo.AttendanceEventRepo;
import com.global.hr.Repo.EventRepo;
import com.global.hr.Repo.RegistrationRepo;
import com.opencsv.CSVWriter;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private final EventRepo eventRepo;
    private final RegistrationRepo registrationRepo;
    private final AttendanceEventRepo attendanceEventRepo;

    public ExportService(EventRepo eventRepo, 
                        RegistrationRepo registrationRepo,
                        AttendanceEventRepo attendanceEventRepo) {
        this.eventRepo = eventRepo;
        this.registrationRepo = registrationRepo;
        this.attendanceEventRepo = attendanceEventRepo;
    }

    public AttendeeExportResponse exportAttendeesForEvent(Long eventId) {
        try {
            // Get event details
            Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
            
            // Get all registrations for this event
            List<Registration> registrations = registrationRepo.findByEvent(event);
            
            // Create CSV content
            StringWriter stringWriter = new StringWriter();
            CSVWriter csvWriter = new CSVWriter(stringWriter);
            
            // Write CSV header
            String[] header = {
                "Attendee Name", "Email", "Registration Status", "Registration Date",
                "Total Time (Hours)", "Check-in Time", "Check-out Time", 
                "Total Attendance Events", "Last Activity"
            };
            csvWriter.writeNext(header);
            
            // Write data for each attendee
            for (Registration registration : registrations) {
                User user = registration.getUser();
                
                // Get attendance events for this registration
                List<AttendanceEvent> events = attendanceEventRepo.findByRegistrationOrderByCreatedAtAsc(registration);
                
                // Calculate attendance metrics
                String totalTime = calculateTotalAttendanceTime(events);
                String checkinTime = getFirstCheckinTime(events);
                String checkoutTime = getLastCheckoutTime(events);
                String lastActivity = getLastActivityTime(events);
                
                String[] row = {
                    user.getName(),
                    user.getEmail(),
                    registration.getStatus().toString(),
                    registration.getCreatedAt().toString(),
                    totalTime,
                    checkinTime,
                    checkoutTime,
                    String.valueOf(events.size()),
                    lastActivity
                };
                csvWriter.writeNext(row);
            }
            
            csvWriter.close();
            
            // Generate filename
            String filename = "attendees_" + 
                            event.getEventName().replaceAll("[^a-zA-Z0-9]", "_") + "_" + 
                            java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
                            ".csv";
            
            return new AttendeeExportResponse(stringWriter.toString(), filename);
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV: " + e.getMessage(), e);
        }
    }

    private String calculateTotalAttendanceTime(List<AttendanceEvent> events) {
        if (events.isEmpty()) return "0s";
        
        long totalSeconds = 0;
        Instant checkinTime = null;
        
        for (AttendanceEvent event : events) {
            switch (event.getEventType()) {
                case CHECKIN:
                case RESUME:
                    checkinTime = event.getCreatedAt();
                    break;
                case PAUSE:
                case CHECKOUT:
                    if (checkinTime != null) {
                        Duration duration = Duration.between(checkinTime, event.getCreatedAt());
                        totalSeconds += duration.getSeconds();
                        checkinTime = null; // Reset for next session
                    }
                    break;
            }
        }
        
        return formatDuration(totalSeconds);
    }

    private String formatDuration(long totalSeconds) {
        if (totalSeconds < 60) {
            // Less than 1 minute: show as seconds
            return totalSeconds + "s";
        } else if (totalSeconds < 3600) {
            // Less than 1 hour: show as minutes:seconds
            long minutes = totalSeconds / 60;
            long seconds = totalSeconds % 60;
            return String.format("%d:%02d", minutes, seconds);
        } else {
            // 1 hour or more: show as hours:minutes
            long hours = totalSeconds / 3600;
            long minutes = (totalSeconds % 3600) / 60;
            return String.format("%d:%02d", hours, minutes);
        }
    }

    private String getFirstCheckinTime(List<AttendanceEvent> events) {
        return events.stream()
            .filter(e -> e.getEventType() == AttendanceEventType.CHECKIN)
            .findFirst()
            .map(e -> e.getCreatedAt().toString())
            .orElse("N/A");
    }

    private String getLastCheckoutTime(List<AttendanceEvent> events) {
        return events.stream()
            .filter(e -> e.getEventType() == AttendanceEventType.CHECKOUT)
            .reduce((first, second) -> second)
            .map(e -> e.getCreatedAt().toString())
            .orElse("N/A");
    }

    private String getLastActivityTime(List<AttendanceEvent> events) {
        return events.stream()
            .map(e -> e.getCreatedAt().toString())
            .reduce((first, second) -> second)
            .orElse("N/A");
    }
}
