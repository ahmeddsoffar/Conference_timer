package com.global.hr.DTO;

public class RegistrationDtoResponse {
	   public Long registrationId;
       public Long eventId;
       public String code;
       public String qrBase64;
	   public RegistrationDtoResponse(Long registrationId, Long eventId, String code, String qrBase64) {
		super();
		this.registrationId = registrationId;
		this.eventId = eventId;
		this.code = code;
		this.qrBase64 = qrBase64;
	   }
  
}
