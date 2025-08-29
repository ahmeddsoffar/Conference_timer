package com.global.hr.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.global.hr.Entity.Event;
import com.global.hr.Entity.Registration;
import com.global.hr.Entity.User;

import jakarta.persistence.LockModeType;

public interface RegistrationRepo extends JpaRepository <Registration, Long> {
	boolean existsByUserAndEvent(User user, Event event);
    Optional<Registration> findByIdAndUserId(Long id, Long userId);
    Optional<Registration> findByCode(String code);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Registration r where r.code = :code")
    Optional<Registration> findByCodeForUpdate(@Param("code") String code);

}
