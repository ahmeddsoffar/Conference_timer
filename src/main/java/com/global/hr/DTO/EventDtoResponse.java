package com.global.hr.DTO;

import java.time.LocalDateTime;

public class EventDtoResponse {
	 private Long id;
	 private String eventName;
	    private LocalDateTime eventStartTime;
	    private LocalDateTime eventEndTime;
		public EventDtoResponse(Long id, String eventName, LocalDateTime eventStartTime, LocalDateTime eventEndTime) {
			super();
			this.id = id;
			this.eventName = eventName;
			this.eventStartTime = eventStartTime;
			this.eventEndTime = eventEndTime;
		}
		public String getEventName() {
			return eventName;
		}
		public void setEventName(String eventName) {
			this.eventName = eventName;
		}
		public Long getId() {
			return id;
		}
		public void setId(Long id) {
			this.id = id;
		}
		public LocalDateTime getEventStartTime() {
			return eventStartTime;
		}
		public void setEventStartTime(LocalDateTime eventStartTime) {
			this.eventStartTime = eventStartTime;
		}
		public LocalDateTime getEventEndTime() {
			return eventEndTime;
		}
		public void setEventEndTime(LocalDateTime eventEndTime) {
			this.eventEndTime = eventEndTime;
		}

}
