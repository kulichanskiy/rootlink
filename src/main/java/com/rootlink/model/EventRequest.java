package com.rootlink.model;

import java.time.LocalDateTime;

public class EventRequest {

    private Long userId;
    private Long eventId;
    private String status;     // PENDING | APPROVED | DECLINED | CANCELLED
    private String message;    // optional intro message from member
    private LocalDateTime createdAt;

    public EventRequest() {}

    // ── Getters & Setters ────────────────────────────────────

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
