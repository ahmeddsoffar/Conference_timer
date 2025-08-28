package com.global.hr.DTO;

import java.time.LocalDateTime;

public class EventDtoResponse {
	 private String eventName;
	    private LocalDateTime startTime;
	    private LocalDateTime endTime;
		public EventDtoResponse(String eventName, LocalDateTime startTime, LocalDateTime endTime) {
			super();
			this.eventName = eventName;
			this.startTime = startTime;
			this.endTime = endTime;
		}
		public String getEventName() {
			return eventName;
		}
		public void setEventName(String eventName) {
			this.eventName = eventName;
		}
		public LocalDateTime getStartTime() {
			return startTime;
		}
		public void setStartTime(LocalDateTime startTime) {
			this.startTime = startTime;
		}
		public LocalDateTime getEndTime() {
			return endTime;
		}
		public void setEndTime(LocalDateTime endTime) {
			this.endTime = endTime;
		}

}
