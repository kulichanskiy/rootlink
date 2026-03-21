package com.rootlink.dto;

import com.rootlink.model.ServiceBooking;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ServiceBookingDTO {
    private Long id, userId, serviceId;
    private String status;
    @NotNull private LocalDateTime bookedTime;
    private LocalDateTime createdAt;

    public ServiceBookingDTO() {}

    public static ServiceBookingDTO from(ServiceBooking b) {
        ServiceBookingDTO dto = new ServiceBookingDTO();
        dto.id = b.getId(); dto.userId = b.getUserId(); dto.serviceId = b.getServiceId();
        dto.status = b.getStatus(); dto.bookedTime = b.getBookedTime(); dto.createdAt = b.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; } public void setUserId(Long u) { this.userId = u; }
    public Long getServiceId() { return serviceId; } public void setServiceId(Long s) { this.serviceId = s; }
    public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
    public LocalDateTime getBookedTime() { return bookedTime; } public void setBookedTime(LocalDateTime t) { this.bookedTime = t; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}
