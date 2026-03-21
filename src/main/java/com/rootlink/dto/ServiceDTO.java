package com.rootlink.dto;

import com.rootlink.model.Service;
import jakarta.validation.constraints.NotBlank;

public class ServiceDTO {
    private Long id;
    @NotBlank(message = "Title is required") private String title;
    private String description;
    @NotBlank(message = "Type is required") private String type;
    private String tags;
    private String imageUrl;
    @NotBlank(message = "Location is required") private String location;
    private Long providerId;

    public ServiceDTO() {}

    public static ServiceDTO from(Service s) {
        ServiceDTO dto = new ServiceDTO();
        dto.id = s.getId(); dto.title = s.getTitle(); dto.description = s.getDescription();
        dto.type = s.getType(); dto.tags = s.getTags(); dto.imageUrl = s.getImageUrl();
        dto.location = s.getLocation(); dto.providerId = s.getProviderId();
        return dto;
    }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String t) { this.title = t; }
    public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
    public String getType() { return type; } public void setType(String t) { this.type = t; }
    public String getTags() { return tags; } public void setTags(String t) { this.tags = t; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String u) { this.imageUrl = u; }
    public String getLocation() { return location; } public void setLocation(String l) { this.location = l; }
    public Long getProviderId() { return providerId; } public void setProviderId(Long p) { this.providerId = p; }
}
