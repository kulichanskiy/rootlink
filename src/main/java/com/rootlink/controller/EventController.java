package com.rootlink.controller;

import com.rootlink.dto.EventDTO;
import com.rootlink.security.RootlinkUserPrincipal;
import com.rootlink.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * GET    /api/events                                     – UC-04 Browse Events (public)
 * POST   /api/events                                     – UC-05 Create Event
 * GET    /api/events/{id}                                – UC-04 View Single Event (public)
 * PUT    /api/events/{id}                                – UC-08 Manage Event
 * DELETE /api/events/{id}                                – UC-08 Cancel Event
 * POST   /api/events/{id}/join                           – UC-06 Request to Join
 * PUT    /api/events/{id}/requests/{userId}/approve      – UC-07 Approve Request
 * PUT    /api/events/{id}/requests/{userId}/reject       – UC-07 Decline Request
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // ── UC-04: Browse Events (public) ────────────────────────

    @GetMapping
    public ResponseEntity<List<EventDTO>> listEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String tags) {

        return ResponseEntity.ok(eventService.findFiltered(category, location, tags));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    // ── UC-05: Create Event ──────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventDTO> createEvent(
            @RequestBody @Valid EventDTO dto,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        EventDTO created = eventService.create(dto, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── UC-08: Edit Event ────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @RequestBody @Valid EventDTO dto,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        return ResponseEntity.ok(eventService.update(id, dto, principal.getUserId()));
    }

    // ── UC-08: Cancel Event ──────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        eventService.cancel(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ── UC-06: Request to Join ───────────────────────────────

    @PostMapping("/{id}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> joinEvent(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        String message = (body != null) ? body.get("message") : null;
        eventService.submitJoinRequest(id, principal.getUserId(), message);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("status", "PENDING",
                             "message", "Your join request has been submitted."));
    }

    // ── UC-07: Approve Participant ───────────────────────────

    @PutMapping("/{eventId}/requests/{userId}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> approveRequest(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        eventService.approveRequest(eventId, userId, principal.getUserId());
        return ResponseEntity.ok(Map.of("status", "APPROVED"));
    }

    // ── UC-07: Decline Participant ───────────────────────────

    @PutMapping("/{eventId}/requests/{userId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> declineRequest(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {

        eventService.declineRequest(eventId, userId, principal.getUserId());
        return ResponseEntity.ok(Map.of("status", "DECLINED"));
    }
}
