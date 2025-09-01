package com.global.hr.DTO;

import java.util.List;

/**
 * DTO for attendee dashboard statistics response
 */
public class AttendeeDashboardStatsResponse {
    private final int upcomingEvents;
    private final double totalAttendanceHours;
    private final int qrScans;
    private final int eventsAttended;
    private final List<RecentActivityResponse> recentActivity;
    
    public AttendeeDashboardStatsResponse(int upcomingEvents, double totalAttendanceHours, int qrScans, int eventsAttended, List<RecentActivityResponse> recentActivity) {
        this.upcomingEvents = upcomingEvents;
        this.totalAttendanceHours = totalAttendanceHours;
        this.qrScans = qrScans;
        this.eventsAttended = eventsAttended;
        this.recentActivity = recentActivity;
    }
    
    public int getUpcomingEvents() { 
        return upcomingEvents; 
    }
    
    public double getTotalAttendanceHours() { 
        return totalAttendanceHours; 
    }
    
    public int getQrScans() { 
        return qrScans; 
    }
    
    public int getEventsAttended() { 
        return eventsAttended; 
    }
    
    public List<RecentActivityResponse> getRecentActivity() { 
        return recentActivity; 
    }
}
