package com.global.hr.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")

public class Admin {
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
	 @Column(nullable = false, unique = true)
     private String email;
	 private String staffName;
	 private String password;
		public Long getId() {
			return id;
		}
		public String getEmail() {
			return email;
		}
		public void setEmail(String email) {
			this.email = email;
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
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}

}
