package com.global.hr.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.global.hr.DTO.AdminDtoRequest;
import com.global.hr.DTO.AdminDtoResponse;
import com.global.hr.DTO.EventDtoRequest;
import com.global.hr.DTO.EventDtoResponse;
import com.global.hr.Entity.Event;
import com.global.hr.Service.AdminService;
import com.global.hr.Service.EventService;
@RestController
//@RequestMapping("/auth")
public class AdminController {
	@Autowired
    private  final EventService eventService;
	private final AdminService adminService;

    
	public AdminController(EventService eventService,AdminService adminService) {
		super();
		this.eventService = eventService;
		this.adminService=adminService;
	}
	 @PostMapping("/auth/register")
	    public ResponseEntity<AdminDtoResponse> register(@RequestBody AdminDtoRequest dto) {
	        AdminDtoResponse response = adminService.register(dto);
	        return ResponseEntity.ok(response);
	    }

	@PostMapping("/event/create")
    public ResponseEntity<EventDtoResponse> createEvent(@RequestBody EventDtoRequest eventDto) {
		EventDtoResponse response = eventService.createEvent(eventDto);
	    return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/event/showevents")
    public ResponseEntity<List<EventDtoResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/event/getevent/{id}")
    public ResponseEntity<EventDtoResponse> getEventById(@PathVariable Long id) {
    	EventDtoResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/event/updateevent/{id}")
    public ResponseEntity<EventDtoResponse> updateEvent(@PathVariable Long id, @RequestBody EventDtoRequest eventDto) {
    	EventDtoResponse updated = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/event/deleteevent/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
    	 eventService.deleteEvent(id);
    	    return ResponseEntity.noContent().build();
    }
}
