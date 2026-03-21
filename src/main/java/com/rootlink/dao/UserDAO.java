package com.rootlink.dao;

import com.rootlink.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class UserDAO {

    private final JdbcTemplate jdbc;

    public UserDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ── RowMapper ────────────────────────────────────────────

    private static final RowMapper<User> ROW_MAPPER = (rs, rowNum) -> {
        User u = new User();
        u.setId(rs.getLong("id"));
        u.setEmail(rs.getString("email"));
        u.setPassword(rs.getString("password"));
        u.setRole(rs.getString("role"));
        u.setPreferences(rs.getString("preferences"));
        u.setLocation(rs.getString("location"));
        u.setAvatarUrl(rs.getString("avatar_url"));
        u.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return u;
    };

    // ── Queries ──────────────────────────────────────────────

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        List<User> results = jdbc.query(sql, ROW_MAPPER, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> results = jdbc.query(sql, ROW_MAPPER, email);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    /** Inserts a new user and returns the generated id. */
    public Long insert(User user) {
        String sql = """
                INSERT INTO users (email, password, role, preferences, location, avatar_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getEmail());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getRole() != null ? user.getRole() : "MEMBER");
            ps.setString(4, user.getPreferences());
            ps.setString(5, user.getLocation());
            ps.setString(6, user.getAvatarUrl());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public int update(User user) {
        String sql = """
                UPDATE users
                SET preferences = ?, location = ?, avatar_url = ?
                WHERE id = ?
                """;
        return jdbc.update(sql, user.getPreferences(), user.getLocation(),
                user.getAvatarUrl(), user.getId());
    }

    public int deleteById(Long id) {
        return jdbc.update("DELETE FROM users WHERE id = ?", id);
    }
}
