package com.rootlink.dao;

import com.rootlink.model.Event;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class EventDAO {

    private final JdbcTemplate jdbc;

    public EventDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ── RowMapper ────────────────────────────────────────────

    private static final RowMapper<Event> ROW_MAPPER = (rs, rowNum) -> {
        Event e = new Event();
        e.setId(rs.getLong("id"));
        e.setTitle(rs.getString("title"));
        e.setDescription(rs.getString("description"));
        e.setImageUrl(rs.getString("image_url"));
        e.setCategory(rs.getString("category"));
        e.setTags(rs.getString("tags"));
        e.setEventDatetime(rs.getTimestamp("event_datetime").toLocalDateTime());
        e.setLocation(rs.getString("location"));
        e.setCapacity(rs.getInt("capacity"));
        e.setStatus(rs.getString("status"));
        e.setOrganizerId(rs.getLong("organizer_id"));
        return e;
    };

    // ── Queries ──────────────────────────────────────────────

    public Optional<Event> findById(Long id) {
        List<Event> results = jdbc.query("SELECT * FROM events WHERE id = ?", ROW_MAPPER, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /**
     * Flexible filter query — only applies WHERE clauses for non-null parameters.
     * Returns only OPEN or FULL events with a future event_datetime.
     */
    public List<Event> findFiltered(String category, String location, String tags) {
        StringBuilder sql = new StringBuilder(
                "SELECT * FROM events WHERE status IN ('OPEN','FULL') AND event_datetime > NOW()");
        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank()) {
            sql.append(" AND category = ?");
            params.add(category);
        }
        if (location != null && !location.isBlank()) {
            sql.append(" AND location LIKE ?");
            params.add("%" + location + "%");
        }
        if (tags != null && !tags.isBlank()) {
            sql.append(" AND tags LIKE ?");
            params.add("%" + tags + "%");
        }
        sql.append(" ORDER BY event_datetime ASC");

        return jdbc.query(sql.toString(), ROW_MAPPER, params.toArray());
    }

    public List<Event> findByOrganizerId(Long organizerId) {
        return jdbc.query("SELECT * FROM events WHERE organizer_id = ? ORDER BY event_datetime DESC",
                ROW_MAPPER, organizerId);
    }

    /** Counts how many requests are currently APPROVED for an event. */
    public int countApproved(Long eventId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM event_requests WHERE event_id = ? AND status = 'APPROVED'",
                Integer.class, eventId);
        return count != null ? count : 0;
    }

    public Long insert(Event event) {
        String sql = """
                INSERT INTO events (title, description, image_url, category, tags,
                    event_datetime, location, capacity, status, organizer_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, event.getTitle());
            ps.setString(2, event.getDescription());
            ps.setString(3, event.getImageUrl());
            ps.setString(4, event.getCategory());
            ps.setString(5, event.getTags());
            ps.setObject(6, event.getEventDatetime());
            ps.setString(7, event.getLocation());
            ps.setInt(8, event.getCapacity());
            ps.setLong(9, event.getOrganizerId());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public int update(Event event) {
        String sql = """
                UPDATE events
                SET title = ?, description = ?, image_url = ?, category = ?, tags = ?,
                    event_datetime = ?, location = ?, capacity = ?
                WHERE id = ?
                """;
        return jdbc.update(sql,
                event.getTitle(), event.getDescription(), event.getImageUrl(),
                event.getCategory(), event.getTags(), event.getEventDatetime(),
                event.getLocation(), event.getCapacity(), event.getId());
    }

    /** Updates only the status column (OPEN → FULL, FULL → OPEN, OPEN → CANCELLED, etc.) */
    public int updateStatus(Long eventId, String status) {
        return jdbc.update("UPDATE events SET status = ? WHERE id = ?", status, eventId);
    }
}
