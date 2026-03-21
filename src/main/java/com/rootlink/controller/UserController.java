package com.rootlink.controller;

import com.rootlink.dto.UserDTO;
import com.rootlink.security.RootlinkUserPrincipal;
import com.rootlink.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * POST   /api/users          – UC-01 Register Account
 * GET    /api/users/{id}     – UC-03 View Profile
 * PUT    /api/users/{id}     – UC-03 Update Profile
 * DELETE /api/users/{id}     – Delete Account
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** UC-01: Register — open to guests, no JWT required. */
    @PostMapping
    public ResponseEntity<UserDTO> register(@RequestBody @Valid UserDTO dto) {
        UserDTO created = userService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** UC-03: View any user profile by id. */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    /** UC-03: Update own profile. Only the authenticated user may update their own record. */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid UserDTO dto,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        if (!principal.getUserId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(userService.update(id, dto));
    }

    /** Delete own account. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        if (!principal.getUserId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
