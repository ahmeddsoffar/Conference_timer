package com.global.hr.DTO;

public class BulkCheckoutResponse {
    private Long eventId;
    private int totalRegistrations;
    private int checkedOutCount;
    private int alreadyCheckedOutCount;
    
    public BulkCheckoutResponse(Long eventId, int totalRegistrations, int checkedOutCount, int alreadyCheckedOutCount) {
        this.eventId = eventId;
        this.totalRegistrations = totalRegistrations;
        this.checkedOutCount = checkedOutCount;
        this.alreadyCheckedOutCount = alreadyCheckedOutCount;
    }
    
    // Getters and setters
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    
    public int getTotalRegistrations() { return totalRegistrations; }
    public void setTotalRegistrations(int totalRegistrations) { this.totalRegistrations = totalRegistrations; }
    
    public int getCheckedOutCount() { return checkedOutCount; }
    public void setCheckedOutCount(int checkedOutCount) { this.checkedOutCount = checkedOutCount; }
    
    public int getAlreadyCheckedOutCount() { return alreadyCheckedOutCount; }
    public void setAlreadyCheckedOutCount(int alreadyCheckedOutCount) { this.alreadyCheckedOutCount = alreadyCheckedOutCount; }
}
