package com.rootlink.model;

import java.time.LocalDateTime;

public class Event {

    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String category;
    private String tags;
    private LocalDateTime eventDatetime;
    private String location;
    private int capacity;
    private String status;       // OPEN | FULL | CANCELLED | COMPLETED
    private Long organizerId;

    public Event() {}

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
