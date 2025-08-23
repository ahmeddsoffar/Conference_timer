package com.global.hr.Entity;

import jakarta.persistence.*;
@Entity
@Table(name = "attendees")
public class Attendee {
	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @ManyToOne
	    private User user;

	    @ManyToOne
	    private Event event;

	    private String status;  

	    private Long totalTime;

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public User getUser() {
			return user;
		}

		public void setUser(User user) {
			this.user = user;
		}

		public Event getEvent() {
			return event;
		}

		public void setEvent(Event event) {
			this.event = event;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public Long getTotalTime() {
			return totalTime;
		}

		public void setTotalTime(Long totalTime) {
			this.totalTime = totalTime;
		} 
	

}
