package com.global.hr.DTO;

public class AdminDtoResponse {
	private Long id;
    private String staffName;
    private String email;
    private String message;
	public AdminDtoResponse(Long id, String staffName, String email, String message) {
		super();
		this.id = id;
		this.staffName = staffName;
		this.email = email;
		this.message = message;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getStaffName() {
		return staffName;
	}
	public void setStaffName(String staffName) {
		this.staffName = staffName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}

}
