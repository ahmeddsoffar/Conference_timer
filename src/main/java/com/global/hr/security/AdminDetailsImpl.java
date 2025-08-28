package com.global.hr.security;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.global.hr.Entity.Admin;
public class AdminDetailsImpl implements UserDetails{
	 private String email;
	 private String password;

	    public AdminDetailsImpl(Admin admin) {
	        this.email = admin.getEmail();
	        this.password = admin.getPassword();
	    }

	    @Override
	    public Collection<? extends GrantedAuthority> getAuthorities() {
	        // Admin role
	        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
	    }

	    @Override
	    public String getPassword() {
	        return password;
	    }

	    @Override
	    public String getUsername() {
	        return email;
	    }

	    @Override
	    public boolean isAccountNonExpired() {
	        return true; // You can implement logic if needed
	    }

	    @Override
	    public boolean isAccountNonLocked() {
	        return true; // You can implement logic if needed
	    }

	    @Override
	    public boolean isCredentialsNonExpired() {
	        return true; // You can implement logic if needed
	    }

	    @Override
	    public boolean isEnabled() {
	        return true; // You can implement logic if needed
	    }

}
