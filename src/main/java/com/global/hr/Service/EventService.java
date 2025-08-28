package com.global.hr.Service;

import com.global.hr.DTO.EventDtoRequest;
import com.global.hr.DTO.EventDtoResponse;
import com.global.hr.Entity.Event;
import com.global.hr.Repo.EventRepo;
import com.global.hr.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {
	@Autowired
    private final EventRepo eventRepo;
    public EventService(EventRepo eventRepo) {
		super();
		this.eventRepo = eventRepo;
	}

    public EventDtoResponse createEvent(EventDtoRequest dto) {
    	 Event event = new Event(
    	            dto.getEventName(),
    	            dto.getStartTime(),
    	            dto.getEndTime()
    	        );

    	        Event saved = eventRepo.save(event);

    	        return new EventDtoResponse(
    	            saved.getEventName(),
    	            saved.getEventStartTime(),
    	            saved.getEventEndTime()
    	        );
    }

    public List<EventDtoResponse> getAllEvents() {
        return eventRepo.findAll().stream()
                .map(event -> new EventDtoResponse(
                        event.getEventName(),
                        event.getEventStartTime(),
                        event.getEventEndTime()
                ))
                .toList();
    }

    public EventDtoResponse getEventById(Long id) {
        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + id));

        return new EventDtoResponse(
                event.getEventName(),
                event.getEventStartTime(),
                event.getEventEndTime()
        );
    }

    public EventDtoResponse updateEvent(Long id, EventDtoRequest dto) {
        return eventRepo.findById(id)
                .map(existing -> {
                    existing.setEventName(dto.getEventName());
                    existing.setEventStartTime(dto.getStartTime());
                    existing.setEventEndTime(dto.getEndTime());

                    Event saved = eventRepo.save(existing);
                    // map back to DTO
                    return new EventDtoResponse(
                            saved.getEventName(),
                            saved.getEventStartTime(),
                            saved.getEventEndTime()
                    );
                })
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

	public void deleteEvent(Long id) {
		Event event = eventRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + id));
        eventRepo.delete(event);
    }

    
}
