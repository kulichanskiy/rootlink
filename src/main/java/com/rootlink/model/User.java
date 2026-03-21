package com.rootlink.model;

import java.time.LocalDateTime;

/**
 * Plain Java representation of a row in the users table.
 * No ORM annotations — mapped explicitly by UserRowMapper.
 */
public class User {

    private Long id;
    private String email;
    private String password;   // bcrypt hash
    private String role;       // MEMBER | ADMIN
    private String preferences;
    private String location;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public User() {}

    public User(Long id, String email, String password, String role,
                String preferences, String location, String avatarUrl,
                LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.preferences = preferences;
        this.location = location;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
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
