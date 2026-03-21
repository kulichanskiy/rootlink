package com.rootlink.model;

import java.time.LocalDateTime;

public class ServiceBooking {

    private Long id;
    private Long userId;
    private Long serviceId;
    private String status;          // PENDING | APPROVED | DECLINED | CANCELLED
    private LocalDateTime bookedTime;
    private LocalDateTime createdAt;

    public ServiceBooking() {}

    // ── Getters & Setters ────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getBookedTime() { return bookedTime; }
    public void setBookedTime(LocalDateTime bookedTime) { this.bookedTime = bookedTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
