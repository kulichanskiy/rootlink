package com.rootlink.service;

import com.rootlink.dao.EventDAO;
import com.rootlink.dao.EventRequestDAO;
import com.rootlink.dao.NotificationDAO;
import com.rootlink.dto.EventDTO;
import com.rootlink.exception.ConflictException;
import com.rootlink.exception.ForbiddenException;
import com.rootlink.exception.ResourceNotFoundException;
import com.rootlink.model.Event;
import com.rootlink.model.EventRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventDAO eventDAO;
    private final EventRequestDAO eventRequestDAO;
    private final NotificationDAO notificationDAO;

    public EventService(EventDAO eventDAO, EventRequestDAO eventRequestDAO,
                        NotificationDAO notificationDAO) {
        this.eventDAO = eventDAO;
        this.eventRequestDAO = eventRequestDAO;
        this.notificationDAO = notificationDAO;
    }

    // ── UC-04: Browse / List Events ──────────────────────────

    @Transactional(readOnly = true)
    public List<EventDTO> findFiltered(String category, String location, String tags) {
        return eventDAO.findFiltered(category, location, tags)
                .stream()
                .map(EventDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventDTO findById(Long id) {
        Event event = eventDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        return EventDTO.from(event);
    }

    // ── UC-05: Create Event ──────────────────────────────────

    @Transactional
    public EventDTO create(EventDTO dto, Long organizerId) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setImageUrl(dto.getImageUrl());
        event.setCategory(dto.getCategory());
        event.setTags(dto.getTags());
        event.setEventDatetime(dto.getEventDatetime());
        event.setLocation(dto.getLocation());
        event.setCapacity(dto.getCapacity());
        event.setOrganizerId(organizerId);

        Long newId = eventDAO.insert(event);
        event.setId(newId);
        event.setStatus("OPEN");
        return EventDTO.from(event);
    }

    // ── UC-08: Manage Event (edit / cancel) ──────────────────

    @Transactional
    public EventDTO update(Long eventId, EventDTO dto, Long requestingUserId) {
        Event event = requireOrganizerAccess(eventId, requestingUserId);

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setImageUrl(dto.getImageUrl());
        event.setCategory(dto.getCategory());
        event.setTags(dto.getTags());
        event.setEventDatetime(dto.getEventDatetime());
        event.setLocation(dto.getLocation());
        event.setCapacity(dto.getCapacity());

        eventDAO.update(event);
        return EventDTO.from(event);
    }

    @Transactional
    public void cancel(Long eventId, Long requestingUserId) {
        requireOrganizerAccess(eventId, requestingUserId);
        eventDAO.updateStatus(eventId, "CANCELLED");
        // Notify all approved participants
        eventRequestDAO.findByEventId(eventId).stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .forEach(r -> notificationDAO.insert(
                        r.getUserId(),
                        "EVENT_CANCELLED",
                        "The event you were attending has been cancelled."));
    }

    // ── UC-06: Request to Join Event ─────────────────────────

    @Transactional
    public void submitJoinRequest(Long eventId, Long userId, String message) {
        Event event = eventDAO.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

        if (!"OPEN".equals(event.getStatus())) {
            throw new ConflictException("This event is not open for join requests.");
        }
        if (eventRequestDAO.exists(userId, eventId)) {
            throw new ConflictException("You have already submitted a request for this event.");
        }

        EventRequest request = new EventRequest();
        request.setUserId(userId);
        request.setEventId(eventId);
        request.setMessage(message);
        eventRequestDAO.insert(request);

        // Notify the organizer
        notificationDAO.insert(
                event.getOrganizerId(),
                "EVENT_REQUEST",
                "A new member has requested to join your event: " + event.getTitle());
    }

    // ── UC-07: Approve / Decline Participants ────────────────

    @Transactional
    public void approveRequest(Long eventId, Long applicantUserId, Long requestingUserId) {
        Event event = requireOrganizerAccess(eventId, requestingUserId);

        EventRequest req = eventRequestDAO.findByUserAndEvent(applicantUserId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found."));

        if (!"PENDING".equals(req.getStatus())) {
            throw new ConflictException("This request has already been processed.");
        }

        // Business rule: cannot exceed capacity
        int approved = eventDAO.countApproved(eventId);
        if (approved >= event.getCapacity()) {
            throw new ConflictException("Event has reached its participant capacity.");
        }

        eventRequestDAO.updateStatus(applicantUserId, eventId, "APPROVED");

        // Business rule: if now at capacity, flip status to FULL
        if (approved + 1 >= event.getCapacity()) {
            eventDAO.updateStatus(eventId, "FULL");
        }

        notificationDAO.insert(applicantUserId, "REQUEST_APPROVED",
                "Your request to join \"" + event.getTitle() + "\" has been approved!");
    }

    @Transactional
    public void declineRequest(Long eventId, Long applicantUserId, Long requestingUserId) {
        Event event = requireOrganizerAccess(eventId, requestingUserId);

        EventRequest req = eventRequestDAO.findByUserAndEvent(applicantUserId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found."));

        if (!"PENDING".equals(req.getStatus())) {
            throw new ConflictException("This request has already been processed.");
        }

        eventRequestDAO.updateStatus(applicantUserId, eventId, "DECLINED");

        notificationDAO.insert(applicantUserId, "REQUEST_DECLINED",
                "Your request to join \"" + event.getTitle() + "\" was not accepted.");
    }

    // ── Helper: verify the requesting user is the organizer ──

    private Event requireOrganizerAccess(Long eventId, Long requestingUserId) {
        Event event = eventDAO.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
        if (!event.getOrganizerId().equals(requestingUserId)) {
            throw new ForbiddenException("Only the event organizer can perform this action.");
        }
        return event;
    }
}
