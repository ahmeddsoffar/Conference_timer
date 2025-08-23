package com.global.hr.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.global.hr.Entity.Event;



@Repository
public interface EventRepo  extends JpaRepository<Event, Long> {

}
