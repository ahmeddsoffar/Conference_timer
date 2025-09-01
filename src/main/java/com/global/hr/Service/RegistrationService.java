package com.global.hr.Service;


import java.util.Base64;
import java.util.UUID;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.global.hr.DTO.RegistrationDtoResponse;
import com.global.hr.Entity.Event;
import com.global.hr.Entity.Registration;
import com.global.hr.Entity.RegistrationStatus;
import com.global.hr.Entity.User;
import com.global.hr.Repo.EventRepo;
import com.global.hr.Repo.RegistrationRepo;
import com.global.hr.Repo.UserRepo;
@Service
public class RegistrationService {

    private final EventRepo eventRepo;
    private final RegistrationRepo regRepo;
    private final UserRepo userRepo;
    private final QrCodeService qrCodeService;

    public RegistrationService(EventRepo eventRepo,
                               RegistrationRepo regRepo,
                               UserRepo userRepo,
                               QrCodeService qrCodeService) {
        this.eventRepo = eventRepo;
        this.regRepo = regRepo;
        this.userRepo = userRepo;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public RegistrationDtoResponse registerUserForEvent(String userEmail, Long eventId) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));

        if (regRepo.existsByUserAndEvent(user, event)) {
            throw new IllegalStateException("Already registered for this event.");
        }

        String code = UUID.randomUUID().toString().replace("-", ""); // unique ticket code
        Registration reg = new Registration();
        reg.setUser(user);
        reg.setEvent(event);
        reg.setCode(code);
        reg.setStatus(RegistrationStatus.REGISTERED);
        reg = regRepo.save(reg);

        // What do we encode in QR? Keep it simple: just the code.
        // Later you can encode a URL like https://yourdomain/scan?code=CODE
        byte[] png = qrCodeService.generatePng(code, 300, 300);
        String base64 = Base64.getEncoder().encodeToString(png);

        return new RegistrationDtoResponse(reg.getId(), event.getId(), code, base64);
    }

    public byte[] getQrPngForRegistration(Long regId, Long requestingUserId) {
        Registration reg = regRepo.findByIdAndUserId(regId, requestingUserId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found or not yours."));
        return qrCodeService.generatePng(reg.getCode(), 300, 300);
    }

    public List<RegistrationDtoResponse> getUserRegistrations(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        
        return regRepo.findByUser(user).stream()
                .map(reg -> new RegistrationDtoResponse(
                    reg.getId(), 
                    reg.getEvent().getId(), 
                    reg.getCode(), 
                    Base64.getEncoder().encodeToString(qrCodeService.generatePng(reg.getCode(), 300, 300))
                ))
                .toList();
    }
}