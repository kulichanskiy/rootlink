package com.rootlink.service;

import com.rootlink.dao.NotificationDAO;
import com.rootlink.model.Notification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationDAO notificationDAO;

    public NotificationService(NotificationDAO notificationDAO) {
        this.notificationDAO = notificationDAO;
    }

    @Transactional(readOnly = true)
    public List<Notification> getForUser(Long userId) {
        return notificationDAO.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public int getUnreadCount(Long userId) {
        return notificationDAO.countUnread(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationDAO.markAllReadForUser(userId);
    }

    @Transactional
    public void markRead(Long notificationId) {
        notificationDAO.markRead(notificationId);
    }
}
