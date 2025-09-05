package com.global.hr.Service;

import com.global.hr.DTO.EventDtoRequest;
import com.global.hr.DTO.EventDtoResponse;
import com.global.hr.Entity.Event;
import com.global.hr.Entity.Registration;
import com.global.hr.Entity.AttendanceEvent;
import com.global.hr.Entity.AttendanceEventType;
import com.global.hr.Repo.AttendanceEventRepo;
import com.global.hr.Repo.RegistrationRepo;
import com.global.hr.Repo.EventRepo;
import com.global.hr.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {
	@Autowired
    private final EventRepo eventRepo;
    @Autowired
    private RegistrationRepo registrationRepo;
    @Autowired
    private AttendanceEventRepo attendanceEventRepo;
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
    	            saved.getId(),
    	            saved.getEventName(),
    	            saved.getEventStartTime(),
    	            saved.getEventEndTime()
    	        );
    }

    public List<EventDtoResponse> getAllEvents() {
        return eventRepo.findAll().stream()
                .map(event -> new EventDtoResponse(
                        event.getId(),
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
                event.getId(),
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
                            saved.getId(),
                            saved.getEventName(),
                            saved.getEventStartTime(),
                            saved.getEventEndTime()
                    );
                })
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

	@Transactional
	public void deleteEvent(Long id) {
		Event event = eventRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + id));

		// Load registrations for this event
		java.util.List<com.global.hr.Entity.Registration> registrations = registrationRepo.findByEvent(event);

		if (!registrations.isEmpty()) {
			// Verify all are checked out (last event is CHECKOUT or no events)
			for (com.global.hr.Entity.Registration registration : registrations) {
				com.global.hr.Entity.AttendanceEvent last = attendanceEventRepo.findFirstByRegistrationOrderByCreatedAtDesc(registration);
				if (last != null && last.getEventType() != com.global.hr.Entity.AttendanceEventType.CHECKOUT) {
					throw new IllegalStateException("Cannot delete event while some attendees are not checked out");
				}
			}

			// Delete attendance events for all registrations
			attendanceEventRepo.deleteByRegistrationIn(registrations);

			// Delete registrations
			registrationRepo.deleteAll(registrations);
		}

		// Finally delete the event
		eventRepo.delete(event);
	}

    
}
