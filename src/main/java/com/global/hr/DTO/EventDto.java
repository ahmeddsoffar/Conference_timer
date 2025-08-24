package com.global.hr.DTO;
import lombok.Data;
import java.time.LocalDateTime;


@Data

public class EventDto {
    private String eventName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
