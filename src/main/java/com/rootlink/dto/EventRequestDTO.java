package com.rootlink.dto;

import com.rootlink.model.EventRequest;
import java.time.LocalDateTime;

public class EventRequestDTO {
    private Long userId, eventId;
    private String status, message;
    private LocalDateTime createdAt;

    public EventRequestDTO() {}

    public static EventRequestDTO from(EventRequest r) {
        EventRequestDTO dto = new EventRequestDTO();
        dto.userId = r.getUserId(); dto.eventId = r.getEventId();
        dto.status = r.getStatus(); dto.message = r.getMessage();
        dto.createdAt = r.getCreatedAt();
        return dto;
    }

    public Long getUserId() { return userId; } public void setUserId(Long u) { this.userId = u; }
    public Long getEventId() { return eventId; } public void setEventId(Long e) { this.eventId = e; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
    public String getMessage() { return message; } public void setMessage(String m) { this.message = m; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}
