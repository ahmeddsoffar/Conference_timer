package com.global.hr.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.global.hr.Entity.User;

public class UserDetailsImpl implements UserDetails{
	 private String email;
	    private String password;

	    public UserDetailsImpl(User user) {
	        this.email = user.getEmail();
	        this.password = user.getPassword();
	    }

	    @Override
	    public Collection<? extends GrantedAuthority> getAuthorities() {
	        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
	    }

	    @Override public String getPassword() { return password; }
	    @Override public String getUsername() { return email; }
	    @Override public boolean isAccountNonExpired() { return true; }
	    @Override public boolean isAccountNonLocked() { return true; }
	    @Override public boolean isCredentialsNonExpired() { return true; }
	    @Override public boolean isEnabled() { return true; }
}
