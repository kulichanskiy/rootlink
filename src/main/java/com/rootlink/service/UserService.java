package com.rootlink.service;

import com.rootlink.dao.UserDAO;
import com.rootlink.dto.UserDTO;
import com.rootlink.exception.ConflictException;
import com.rootlink.exception.ResourceNotFoundException;
import com.rootlink.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserDAO userDAO, PasswordEncoder passwordEncoder) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
    }

    // ── UC-01: Register Account ──────────────────────────────

    @Transactional
    public UserDTO register(UserDTO dto) {
        if (userDAO.existsByEmail(dto.getEmail())) {
            throw new ConflictException("An account with this email already exists.");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("MEMBER");
        user.setPreferences(dto.getPreferences());
        user.setLocation(dto.getLocation());
        user.setAvatarUrl(dto.getAvatarUrl());

        Long newId = userDAO.insert(user);
        user.setId(newId);
        return UserDTO.from(user);
    }

    // ── UC-03: Manage Profile ────────────────────────────────

    @Transactional(readOnly = true)
    public UserDTO getById(Long id) {
        User user = userDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return UserDTO.from(user);
    }

    @Transactional
    public UserDTO update(Long id, UserDTO dto) {
        User existing = userDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        existing.setPreferences(dto.getPreferences());
        existing.setLocation(dto.getLocation());
        existing.setAvatarUrl(dto.getAvatarUrl());
        userDAO.update(existing);
        return UserDTO.from(existing);
    }

    @Transactional
    public void delete(Long id) {
        userDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userDAO.deleteById(id);
    }

    // ── Used by Spring Security ──────────────────────────────

    @Transactional(readOnly = true)
    public User loadByEmail(String email) {
        return userDAO.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
