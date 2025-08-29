package com.global.hr.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.global.hr.DTO.AttendanceDtoResponse;
import com.global.hr.DTO.ScanDtoRequest;
import com.global.hr.Service.AttendanceService;

@RestController
@RequestMapping("/scan")
public class ScanController {

    private final AttendanceService attendanceService;

    public ScanController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Body:
     * { "code":"<registrationCode>", "action": "CHECKIN|PAUSE|RESUME|CHECKOUT", "idempotencyKey":"..." }
     * If action omitted -> toggle behavior.
     */
    @PostMapping
    public ResponseEntity<?> scan(@RequestBody ScanDtoRequest body, Authentication auth) {
        // auth should be staff/admin (enforce in security config)
        String staff = auth.getName(); // username/email of staff
        AttendanceDtoResponse res = attendanceService.handleScanByCode(body.code, body.action, body.idempotencyKey);
        return ResponseEntity.ok(Map.of(
            "registrationId", res.registrationId,
            "totalActiveSeconds", res.creditHours,
            "status", res.status
        ));
    }
}