package com.global.hr.Controller;

import com.global.hr.DTO.UserDtoRequest;
import com.global.hr.DTO.UserDtoResponse;
import com.global.hr.DTO.UserDtoLoginRequest;
import com.global.hr.DTO.UserDtoLoginResponse;
import com.global.hr.Repo.UserRepo;
import com.global.hr.Service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.global.hr.Entity.User;

import java.util.*;

@RestController
@RequestMapping("/auth/api/users")
public class UserController {
    public UserController(UserService userService, UserRepo userRepo) {
		super();
		this.userService = userService;
		this.userRepo = userRepo;
	}
    @Autowired
	private final  UserService userService;
    @Autowired
    private final UserRepo userRepo;

    @PostMapping("/register")
    public ResponseEntity<UserDtoResponse> registerUser(@RequestBody UserDtoRequest dto) {
    	UserDtoResponse user = userService.registerUser(dto);
        return ResponseEntity.ok(user);
    }

    


}
