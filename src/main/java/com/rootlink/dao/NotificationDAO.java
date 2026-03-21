package com.rootlink.dao;

import com.rootlink.model.Notification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class NotificationDAO {

    private final JdbcTemplate jdbc;

    public NotificationDAO(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<Notification> ROW_MAPPER = (rs, rowNum) -> {
        Notification n = new Notification();
        n.setId(rs.getLong("id"));
        n.setUserId(rs.getLong("user_id"));
        n.setType(rs.getString("type"));
        n.setMessage(rs.getString("message"));
        n.setRead(rs.getBoolean("is_read"));
        n.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return n;
    };

    public List<Notification> findByUserId(Long userId) {
        return jdbc.query(
                "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
                ROW_MAPPER, userId);
    }

    public int countUnread(Long userId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0",
                Integer.class, userId);
        return count != null ? count : 0;
    }

    public Long insert(Long userId, String type, String message) {
        String sql = """
                INSERT INTO notifications (user_id, type, message, is_read, created_at)
                VALUES (?, ?, ?, 0, NOW())
                """;
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId);
            ps.setString(2, type);
            ps.setString(3, message);
            return ps;
        }, kh);
        return kh.getKey().longValue();
    }

    public int markAllReadForUser(Long userId) {
        return jdbc.update(
                "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", userId);
    }

    public int markRead(Long notificationId) {
        return jdbc.update(
                "UPDATE notifications SET is_read = 1 WHERE id = ?", notificationId);
    }
}
