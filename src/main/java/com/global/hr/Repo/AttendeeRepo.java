package com.global.hr.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.global.hr.Entity.Attendee;


@Repository
public interface AttendeeRepo  extends JpaRepository<Attendee, Long>{

}
