package com.global.hr.DTO;

import java.time.Instant;

/**
 * DTO for recent activity items
 */
public class RecentActivityResponse {
    private final String activityType;
    private final String eventName;
    private final Instant timestamp;
    private final String status;
    
    public RecentActivityResponse(String activityType, String eventName, Instant timestamp, String status) {
        this.activityType = activityType;
        this.eventName = eventName;
        this.timestamp = timestamp;
        this.status = status;
    }
    
    public String getActivityType() { 
        return activityType; 
    }
    
    public String getEventName() { 
        return eventName; 
    }
    
    public Instant getTimestamp() { 
        return timestamp; 
    }
    
    public String getStatus() { 
        return status; 
    }
}
