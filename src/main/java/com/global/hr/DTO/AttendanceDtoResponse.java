package com.global.hr.DTO;

import com.global.hr.Entity.AttendanceEventType;


public class AttendanceDtoResponse {
	 public final double creditHours;
	public final Long registrationId;
    public final AttendanceEventType status;
    public AttendanceDtoResponse(double creditHours, Long registrationId, AttendanceEventType status) {
        this.creditHours = creditHours ;
        this.registrationId = registrationId;
        this.status = status;
    }
    public double getCreditHours() {
		return creditHours;
	}
	public Long getRegistrationId() {
		return registrationId;
	}
	public AttendanceEventType getStatus() {
		return status;
	}
}
