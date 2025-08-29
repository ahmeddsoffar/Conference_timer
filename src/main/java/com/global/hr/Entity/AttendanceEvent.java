package com.global.hr.Entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "attendance_events",
       indexes = {@Index(name="idx_reg_created", columnList="registration_id, created_at")})
public class AttendanceEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // the registration this event belongs to (user + event)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 20)
    private AttendanceEventType eventType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Registration getRegistration() {
		return registration;
	}

	public void setRegistration(Registration registration) {
		this.registration = registration;
	}

	public AttendanceEventType getEventType() {
		return eventType;
	}

	public void setEventType(AttendanceEventType eventType) {
		this.eventType = eventType;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public String getMeta() {
		return meta;
	}

	public void setMeta(String meta) {
		this.meta = meta;
	}

	// optional metadata (device id, idempotency key, raw QR)
    @Column(name = "meta", columnDefinition = "json")
    private String meta;

   
}
