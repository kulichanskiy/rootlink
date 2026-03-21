package com.rootlink.dao;

import com.rootlink.model.Service;
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
public class ServiceDAO {

    private final JdbcTemplate jdbc;

    public ServiceDAO(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<Service> ROW_MAPPER = (rs, rowNum) -> {
        Service s = new Service();
        s.setId(rs.getLong("id"));
        s.setTitle(rs.getString("title"));
        s.setDescription(rs.getString("description"));
        s.setType(rs.getString("type"));
        s.setTags(rs.getString("tags"));
        s.setImageUrl(rs.getString("image_url"));
        s.setLocation(rs.getString("location"));
        s.setProviderId(rs.getLong("provider_id"));
        return s;
    };

    public Optional<Service> findById(Long id) {
        List<Service> results = jdbc.query("SELECT * FROM services WHERE id = ?", ROW_MAPPER, id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<Service> findFiltered(String type, String location, String tags) {
        StringBuilder sql = new StringBuilder("SELECT * FROM services WHERE 1=1");
        List<Object> params = new ArrayList<>();
        if (type != null && !type.isBlank()) { sql.append(" AND type = ?"); params.add(type); }
        if (location != null && !location.isBlank()) { sql.append(" AND location LIKE ?"); params.add("%" + location + "%"); }
        if (tags != null && !tags.isBlank()) { sql.append(" AND tags LIKE ?"); params.add("%" + tags + "%"); }
        sql.append(" ORDER BY id DESC");
        return jdbc.query(sql.toString(), ROW_MAPPER, params.toArray());
    }

    public List<Service> findByProviderId(Long providerId) {
        return jdbc.query("SELECT * FROM services WHERE provider_id = ?", ROW_MAPPER, providerId);
    }

    public Long insert(Service service) {
        String sql = "INSERT INTO services (title, description, type, tags, image_url, location, provider_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, service.getTitle()); ps.setString(2, service.getDescription());
            ps.setString(3, service.getType());  ps.setString(4, service.getTags());
            ps.setString(5, service.getImageUrl()); ps.setString(6, service.getLocation());
            ps.setLong(7, service.getProviderId());
            return ps;
        }, kh);
        return kh.getKey().longValue();
    }

    public int update(Service service) {
        return jdbc.update("UPDATE services SET title=?, description=?, type=?, tags=?, image_url=?, location=? WHERE id=?",
                service.getTitle(), service.getDescription(), service.getType(),
                service.getTags(), service.getImageUrl(), service.getLocation(), service.getId());
    }

    public int deleteById(Long id) { return jdbc.update("DELETE FROM services WHERE id = ?", id); }
}
