package com.global.hr.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.global.hr.Repo.AdminRepo;
import com.global.hr.Repo.UserRepo;
import com.global.hr.security.AdminDetailsImpl;
import com.global.hr.security.UserDetailsImpl;
@Service
public class CustomUserDetailsService implements UserDetailsService {
	@Autowired private UserRepo userRepo;
    @Autowired private AdminRepo adminRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        if(userRepo.findByEmail(email).isPresent())
            return new UserDetailsImpl(userRepo.findByEmail(email).get());
        else if(adminRepo.findByEmail(email).isPresent())
            return new AdminDetailsImpl(adminRepo.findByEmail(email).get());
        throw new UsernameNotFoundException("User not found with email: " + email);
    }

}
