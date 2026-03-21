package com.rootlink.dto;

import com.rootlink.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for User.
 * Decouples the REST API contract from the internal User model.
 * Password is never included in outbound DTOs.
 */
public class UserDTO {

    private Long id;

    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    // Only used on CREATE — never returned in responses
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String role;
    private String preferences;
    private String location;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public UserDTO() {}

    /** Build a safe outbound DTO (no password) from a model object. */
    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.id          = user.getId();
        dto.email       = user.getEmail();
        dto.role        = user.getRole();
        dto.preferences = user.getPreferences();
        dto.location    = user.getLocation();
        dto.avatarUrl   = user.getAvatarUrl();
        dto.createdAt   = user.getCreatedAt();
        return dto;
    }

    // ── Getters & Setters ────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
