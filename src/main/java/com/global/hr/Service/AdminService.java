package com.global.hr.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.global.hr.DTO.AdminDtoRequest;
import com.global.hr.DTO.AdminDtoResponse;
import com.global.hr.Entity.Admin;
import com.global.hr.Repo.AdminRepo;
@Service
public class AdminService {
	private final AdminRepo adminRepository;
    private final PasswordEncoder passwordEncoder;
    public AdminService(AdminRepo adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }
	public AdminDtoResponse register(AdminDtoRequest dto) {
        // Check if email already exists
        adminRepository.findByEmail(dto.getEmail())
                .ifPresent(a -> {
                    throw new RuntimeException("Email already registered");
                });

        // Create admin entity
        Admin admin = new Admin();
        admin.setStaffName(dto.getStaffName());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword())); // hash password

        // Save in DB
        Admin savedAdmin = adminRepository.save(admin);

        // Return response DTO
        return new AdminDtoResponse(
                savedAdmin.getId(),
                savedAdmin.getStaffName(),
                savedAdmin.getEmail(),
                "Admin registered successfully"
        );
    }
}
