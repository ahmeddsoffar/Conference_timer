package com.global.hr.Entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="registrations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","event_id"}))
public class Registration {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="event_id", nullable=false)
    private Event event;

    @Column(nullable=false, unique=true, length=64)
    private String code; // the thing encoded in QR

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

    @Column(nullable=false)
    private Instant createdAt = Instant.now();

    // getters/setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User user) { this.user = user; }
    public Event getEvent() { return event; } public void setEvent(Event event) { this.event = event; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public RegistrationStatus getStatus() { return status; } public void setStatus(RegistrationStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}