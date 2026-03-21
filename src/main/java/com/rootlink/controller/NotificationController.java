package com.rootlink.controller;

import com.rootlink.model.Notification;
import com.rootlink.security.RootlinkUserPrincipal;
import com.rootlink.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * GET   /api/notifications          – UC-12 List all notifications for current user
 * GET   /api/notifications/unread   – Unread count (for notification bell badge)
 * PUT   /api/notifications/read-all – Mark all as read
 * PUT   /api/notifications/{id}/read – Mark single notification as read
 */
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getForUser(principal.getUserId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {
        int count = notificationService.getUnreadCount(principal.getUserId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal RootlinkUserPrincipal principal) {
        notificationService.markAllRead(principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }
}
