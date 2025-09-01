package com.global.hr.DTO;

/**
 * DTO for admin dashboard statistics response
 */
public class DashboardStatsResponse {
    private final long totalEvents;
    private final long totalAttendees;
    private final long totalRegistrations;
    
    public DashboardStatsResponse(long totalEvents, long totalAttendees, long totalRegistrations) {
        this.totalEvents = totalEvents;
        this.totalAttendees = totalAttendees;
        this.totalRegistrations = totalRegistrations;
    }
    
    public long getTotalEvents() { 
        return totalEvents; 
    }
    
    public long getTotalAttendees() { 
        return totalAttendees; 
    }
    
    public long getTotalRegistrations() { 
        return totalRegistrations; 
    }
}
