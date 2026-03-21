package com.rootlink.dao;

import com.rootlink.model.ServiceBooking;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class ServiceBookingDAO {

    private final JdbcTemplate jdbc;

    public ServiceBookingDAO(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final RowMapper<ServiceBooking> ROW_MAPPER = (rs, rowNum) -> {
        ServiceBooking b = new ServiceBooking();
        b.setId(rs.getLong("id"));
        b.setUserId(rs.getLong("user_id"));
        b.setServiceId(rs.getLong("service_id"));
        b.setStatus(rs.getString("status"));
        b.setBookedTime(rs.getTimestamp("booked_time").toLocalDateTime());
        b.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return b;
    };

    public Optional<ServiceBooking> findById(Long id) {
        List<ServiceBooking> r = jdbc.query("SELECT * FROM service_bookings WHERE id = ?", ROW_MAPPER, id);
        return r.isEmpty() ? Optional.empty() : Optional.of(r.get(0));
    }

    public List<ServiceBooking> findByServiceId(Long serviceId) {
        return jdbc.query("SELECT * FROM service_bookings WHERE service_id = ? ORDER BY created_at DESC", ROW_MAPPER, serviceId);
    }

    public Long insert(ServiceBooking booking) {
        String sql = "INSERT INTO service_bookings (user_id, service_id, status, booked_time, created_at) VALUES (?, ?, 'PENDING', ?, NOW())";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, booking.getUserId());
            ps.setLong(2, booking.getServiceId());
            ps.setObject(3, booking.getBookedTime());
            return ps;
        }, kh);
        return kh.getKey().longValue();
    }

    public int updateStatus(Long bookingId, String status) {
        return jdbc.update("UPDATE service_bookings SET status = ? WHERE id = ?", status, bookingId);
    }
}
