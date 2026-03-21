package com.rootlink.controller;

import com.rootlink.dto.ServiceBookingDTO;
import com.rootlink.dto.ServiceDTO;
import com.rootlink.security.RootlinkUserPrincipal;
import com.rootlink.service.ServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * GET    /api/services                         – UC-10 Search Services (public)
 * POST   /api/services                         – UC-09 Post Service Listing
 * GET    /api/services/{id}                    – View Single Service (public)
 * PUT    /api/services/{id}                    – Edit Service Listing
 * DELETE /api/services/{id}                    – Remove Service Listing
 * POST   /api/services/{id}/book               – Book a Service
 * PUT    /api/bookings/{bookingId}/approve      – Approve Booking
 * PUT    /api/bookings/{bookingId}/reject       – Decline Booking
 */
@RestController
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    // ── UC-10: Search Services (public) ─────────────────────

    @GetMapping("/api/services")
    public ResponseEntity<List<ServiceDTO>> listServices(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String tags) {

        return ResponseEntity.ok(serviceService.findFiltered(type, location, tags));
    }

    @GetMapping("/api/services/{id}")
    public ResponseEntity<ServiceDTO> getService(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.findById(id));
    }

    // ── UC-09: Post Service Listing ──────────────────────────

    @PostMapping("/api/services")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServiceDTO> createService(
            @RequestBody @Valid ServiceDTO dto,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        ServiceDTO created = serviceService.create(dto, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/services/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServiceDTO> updateService(
            @PathVariable Long id,
            @RequestBody @Valid ServiceDTO dto,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        return ResponseEntity.ok(serviceService.update(id, dto, principal.getUserId()));
    }

    @DeleteMapping("/api/services/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long id,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        serviceService.delete(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Book a Service ───────────────────────────────────────

    @PostMapping("/api/services/{id}/book")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServiceBookingDTO> bookService(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        LocalDateTime bookedTime = LocalDateTime.parse(body.get("bookedTime"));
        ServiceBookingDTO booking = serviceService.book(id, principal.getUserId(), bookedTime);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // ── Approve / Decline Bookings ───────────────────────────

    @PutMapping("/api/bookings/{bookingId}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> approveBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        serviceService.approveBooking(bookingId, principal.getUserId());
        return ResponseEntity.ok(Map.of("status", "APPROVED"));
    }

    @PutMapping("/api/bookings/{bookingId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> rejectBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        serviceService.declineBooking(bookingId, principal.getUserId());
        return ResponseEntity.ok(Map.of("status", "DECLINED"));
    }
}
