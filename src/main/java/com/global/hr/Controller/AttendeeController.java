package com.global.hr.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;

import com.global.hr.DTO.RegistrationDtoResponse;
import com.global.hr.DTO.EventDtoResponse;
import com.global.hr.DTO.AttendeeDashboardStatsResponse;
import com.global.hr.Entity.User;
import com.global.hr.Repo.UserRepo;
import com.global.hr.Service.RegistrationService;
import com.global.hr.Service.EventService;
import com.global.hr.Service.AttendanceService;
import java.util.List;

@RestController
@RequestMapping("/attendee")
public class AttendeeController {

    private final RegistrationService registrationService;
    private final UserRepo userRepository;
    private final EventService eventService;
    private final AttendanceService attendanceService;

    public AttendeeController(RegistrationService registrationService,
                              UserRepo userRepository,
                              EventService eventService,
                              AttendanceService attendanceService) {
        this.registrationService = registrationService;
        this.userRepository = userRepository;
        this.eventService = eventService;
        this.attendanceService = attendanceService;
    }

    // GET /attendee/events -> returns list of all events for attendees to browse
    @GetMapping("/events")
    public ResponseEntity<List<EventDtoResponse>> getAllEventsForAttendees() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // POST /attendee/events/{eventId}/register
    @PostMapping("/events/{eventId}/register")
    public ResponseEntity<RegistrationDtoResponse> registerForEvent(@PathVariable Long eventId,
                                                               Authentication auth) {
        // JWT subject is the email (we set it when generating JWT)
        String email = auth.getName();
        RegistrationDtoResponse result = registrationService.registerUserForEvent(email, eventId);
        return ResponseEntity.ok(result);
    }

    // GET /attendee/registrations -> returns list of user's registrations
    @GetMapping("/registrations")
    public ResponseEntity<List<RegistrationDtoResponse>> getUserRegistrations(Authentication auth) {
        String email = auth.getName();
        List<RegistrationDtoResponse> registrations = registrationService.getUserRegistrations(email);
        return ResponseEntity.ok(registrations);
    }

    // GET /attendee/registrations/{id}/qr  -> returns PNG image
    @GetMapping(value = "/registrations/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQr(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        byte[] png = registrationService.getQrPngForRegistration(id, user.getId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=qr-"+id+".png")
                .contentType(MediaType.IMAGE_PNG)
                .body(png);
    }

    /**
     * Get dashboard statistics for the authenticated user
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AttendeeDashboardStatsResponse> getUserDashboardStats(Authentication auth) {
        String email = auth.getName();
        AttendeeDashboardStatsResponse stats = attendanceService.getUserDashboardStats(email);
        return ResponseEntity.ok(stats);
    }
}