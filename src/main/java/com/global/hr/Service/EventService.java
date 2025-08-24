package com.global.hr.Service;

import com.global.hr.DTO.EventDto;
import com.global.hr.Entity.Event;
import com.global.hr.Repo.EventRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepo eventRepo;

    public Event createEvent(EventDto dto) {
        Event event = Event.builder()
                .eventName(dto.getEventName())
                .eventStartTime(dto.getStartTime())
                .eventEndTime(dto.getEndTime())
                .build();
        return eventRepo.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepo.findById(id).orElse(null);
    }

    public Event updateEvent(Long id, EventDto dto) {
        return eventRepo.findById(id)
                .map(existing -> {
                    existing.setEventName(dto.getEventName());
                    existing.setEventStartTime(dto.getStartTime());
                    existing.setEventEndTime(dto.getEndTime());
                    return eventRepo.save(existing);
                })
                .orElse(null);
    }

    public void deleteEvent(Long id) {
        if (eventRepo.existsById(id)) {
            eventRepo.deleteById(id);
        }
    }

    
}
