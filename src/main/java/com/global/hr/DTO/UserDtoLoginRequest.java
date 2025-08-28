package com.global.hr.DTO;

public class UserDtoLoginRequest {
	
	 private String email;
	 private String password;
	 public String getPassword() {
		return password;
	}
	 public void setPassword(String password) {
		 this.password = password;
	 }
	 public String getEmail() {
		 return email;
	 }
	 public void setEmail(String email) {
		 this.email = email;
	 }
	 public UserDtoLoginRequest(String email, String password) {
		super();
		this.email = email;
		this.password = password;
	 }
	 
}
