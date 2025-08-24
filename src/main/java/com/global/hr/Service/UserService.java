package com.global.hr.Service;

import com.global.hr.Entity.User;
import com.global.hr.Repo.UserRepo;
import com.global.hr.DTO.UserRegistrationDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDto dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        System.out.println(user.getName()+"has been registered");
        return userRepo.save(user);
    }


    public User login(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        System.out.println(user.getName()+"logged in");
        return user; // for now just return user, later you might return JWT/token
    }



    public User findByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }
}
