package com.global.hr.Entity;

public enum AttendanceEventType {
	CHECKIN,    // scanned to start attendance
    PAUSE,      // scanned to mark break start
    RESUME,     // scanned to resume attendance
    CHECKOUT,   // scanned to end attendance
    MANUAL      // admin manual entry
}
