package com.rootlink.dao;

import com.rootlink.model.EventRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class EventRequestDAO {

    private final JdbcTemplate jdbc;

    public EventRequestDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ── RowMapper ────────────────────────────────────────────

    private static final RowMapper<EventRequest> ROW_MAPPER = (rs, rowNum) -> {
        EventRequest r = new EventRequest();
        r.setUserId(rs.getLong("user_id"));
        r.setEventId(rs.getLong("event_id"));
        r.setStatus(rs.getString("status"));
        r.setMessage(rs.getString("message"));
        r.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return r;
    };

    // ── Queries ──────────────────────────────────────────────

    public Optional<EventRequest> findByUserAndEvent(Long userId, Long eventId) {
        String sql = "SELECT * FROM event_requests WHERE user_id = ? AND event_id = ?";
        List<EventRequest> results = jdbc.query(sql, ROW_MAPPER, userId, eventId);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /** Returns all requests for an event (used by host management page). */
    public List<EventRequest> findByEventId(Long eventId) {
        return jdbc.query(
                "SELECT * FROM event_requests WHERE event_id = ? ORDER BY created_at ASC",
                ROW_MAPPER, eventId);
    }

    /** Returns all pending requests for a given event. */
    public List<EventRequest> findPendingByEventId(Long eventId) {
        return jdbc.query(
                "SELECT * FROM event_requests WHERE event_id = ? AND status = 'PENDING' ORDER BY created_at ASC",
                ROW_MAPPER, eventId);
    }

    public boolean exists(Long userId, Long eventId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM event_requests WHERE user_id = ? AND event_id = ?",
                Integer.class, userId, eventId);
        return count != null && count > 0;
    }

    /** Inserts a new PENDING request. Composite PK prevents duplicates at DB level. */
    public int insert(EventRequest request) {
        String sql = """
                INSERT INTO event_requests (user_id, event_id, status, message, created_at)
                VALUES (?, ?, 'PENDING', ?, NOW())
                """;
        return jdbc.update(sql, request.getUserId(), request.getEventId(), request.getMessage());
    }

    /** Updates the status of a specific request (PENDING → APPROVED / DECLINED / CANCELLED). */
    public int updateStatus(Long userId, Long eventId, String status) {
        return jdbc.update(
                "UPDATE event_requests SET status = ? WHERE user_id = ? AND event_id = ?",
                status, userId, eventId);
    }
}
