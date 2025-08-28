package com.global.hr.Service;

import com.global.hr.Entity.User;
import com.global.hr.Repo.UserRepo;
import com.global.hr.DTO.UserDtoRequest;
import com.global.hr.DTO.UserDtoResponse;
import com.global.hr.DTO.UserDtoLoginResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service

public class UserService {
	@Autowired
    private  final UserRepo userRepo;
	@Autowired
    private  final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
		super();
		this.userRepo = userRepo;
		this.passwordEncoder = passwordEncoder;
	}


	public UserDtoResponse registerUser(UserDtoRequest dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        System.out.println(user.getName()+"has been registered");
        userRepo.save(user);
        return new UserDtoResponse(user.getName(),user.getEmail());
    }


	public UserDtoLoginResponse login(String email, String password) {
	    User user = userRepo.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    if (!passwordEncoder.matches(password, user.getPassword())) {
	        throw new RuntimeException("Invalid credentials");
	    }

	    System.out.println(user.getName() + " logged in");

	    return new UserDtoLoginResponse(
	            user.getId(),
	            user.getName(),
	            user.getEmail()
	            
	    );
	}



    public User findByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }
}
