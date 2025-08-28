package com.global.hr.DTO;

public class UserDtoResponse {
	 private String name;
	 private String email;
	 public String getName() {
		 return name;
	 }
	 public void setName(String name) {
		 this.name = name;
	 }
	 public String getEmail() {
		 return email;
	 }
	 public void setEmail(String email) {
		 this.email = email;
	 }
	 public UserDtoResponse(String name, String email) {
		super();
		this.name = name;
		this.email = email;
	 }
	 

}
