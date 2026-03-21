package com.rootlink.controller;

import com.rootlink.dto.UserDTO;
import com.rootlink.model.User;
import com.rootlink.security.JwtUtil;
import com.rootlink.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * POST /api/auth/login  →  validates credentials, returns JWT token + user profile
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService     userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil         jwtUtil;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userService     = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        User user = userService.loadByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user",  UserDTO.from(user)
        ));
    }

    // ── Inner DTO (used only in this controller) ─────────────

    public static class LoginRequest {
        @jakarta.validation.constraints.NotBlank
        private String email;
        @jakarta.validation.constraints.NotBlank
        private String password;

        public String getEmail()    { return email; }
        public void   setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void   setPassword(String password) { this.password = password; }
    }
}
