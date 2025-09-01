package com.global.hr.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.global.hr.DTO.AdminDtoRequest;
import com.global.hr.DTO.AdminDtoResponse;
import com.global.hr.DTO.DashboardStatsResponse;
import com.global.hr.Entity.Admin;
import com.global.hr.Repo.AdminRepo;
import com.global.hr.Repo.RegistrationRepo;
import com.global.hr.Repo.UserRepo;
import com.global.hr.Repo.EventRepo;

@Service
public class AdminService {
	private final AdminRepo adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationRepo registrationRepo;
    private final UserRepo userRepo;
    private final EventRepo eventRepo;
    
    public AdminService(AdminRepo adminRepository, 
                       PasswordEncoder passwordEncoder,
                       RegistrationRepo registrationRepo,
                       UserRepo userRepo,
                       EventRepo eventRepo) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.registrationRepo = registrationRepo;
        this.userRepo = userRepo;
        this.eventRepo = eventRepo;
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
    
    /**
     * Get dashboard statistics for admin
     */
    public DashboardStatsResponse getDashboardStats() {
        long totalEvents = eventRepo.count();
        long totalRegistrations = registrationRepo.count();
        long totalUsers = userRepo.count();
        
        return new DashboardStatsResponse(
            totalEvents,
            totalUsers,
            totalRegistrations
        );
    }
}
