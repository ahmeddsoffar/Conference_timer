package com.global.hr.DTO;

import java.time.Instant;

public class EventAttendeeResponse {
    private Long registrationId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String registrationCode;
    private String currentStatus;
    private Instant lastActivity;
    private Double totalCreditHours;
    private String lastAction;

    public EventAttendeeResponse() {}

    public EventAttendeeResponse(Long registrationId, Long userId, String userName, String userEmail, 
                                String registrationCode, String currentStatus, Instant lastActivity, 
                                Double totalCreditHours, String lastAction) {
        this.registrationId = registrationId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.registrationCode = registrationCode;
        this.currentStatus = currentStatus;
        this.lastActivity = lastActivity;
        this.totalCreditHours = totalCreditHours;
        this.lastAction = lastAction;
    }

    // Getters and Setters
    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getRegistrationCode() {
        return registrationCode;
    }

    public void setRegistrationCode(String registrationCode) {
        this.registrationCode = registrationCode;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
    }

    public Double getTotalCreditHours() {
        return totalCreditHours;
    }

    public void setTotalCreditHours(Double totalCreditHours) {
        this.totalCreditHours = totalCreditHours;
    }

    public String getLastAction() {
        return lastAction;
    }

    public void setLastAction(String lastAction) {
        this.lastAction = lastAction;
    }
}
