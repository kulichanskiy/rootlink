package com.rootlink.dto;

import com.rootlink.model.Event;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class EventDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    private String description;
    private String imageUrl;

    @NotBlank(message = "Category is required")
    private String category;

    private String tags;

    @NotNull(message = "Event date/time is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime eventDatetime;

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    private String status;
    private Long organizerId;

    public EventDTO() {}

    public static EventDTO from(Event e) {
        EventDTO dto = new EventDTO();
        dto.id            = e.getId();
        dto.title         = e.getTitle();
        dto.description   = e.getDescription();
        dto.imageUrl      = e.getImageUrl();
        dto.category      = e.getCategory();
        dto.tags          = e.getTags();
        dto.eventDatetime = e.getEventDatetime();
        dto.location      = e.getLocation();
        dto.capacity      = e.getCapacity();
        dto.status        = e.getStatus();
        dto.organizerId   = e.getOrganizerId();
        return dto;
    }

    // ── Getters & Setters ────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getEventDatetime() { return eventDatetime; }
    public void setEventDatetime(LocalDateTime eventDatetime) { this.eventDatetime = eventDatetime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
}
