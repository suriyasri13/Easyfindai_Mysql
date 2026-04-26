package com.lostfound.controller;

import com.lostfound.entity.Notification;
import com.lostfound.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")

public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepo;

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        System.out.println("API: Fetching notifications for User ID: " + userId);
        return notificationRepo.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/{userId}/unread-count")
    public long getUnreadCount(@PathVariable Long userId) {
        long count = notificationRepo.countByRecipientIdAndIsReadFalse(userId);
        System.out.println("API: Unread count for User " + userId + " is " + count);
        return count;
    }

    @GetMapping("/global")
    public List<Notification> getGlobalNotifications() {
        // We use 0L as the special ID for Global Broadcasts
        return notificationRepo.findByRecipientIdOrderByCreatedAtDesc(0L);
    }


    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepo.findById(id).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notificationRepo.save(notification);
            return ResponseEntity.ok("Marked as read");
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        if (notificationRepo.existsById(id)) {
            notificationRepo.deleteById(id);
            return ResponseEntity.ok("Notification deleted");
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/user/{userId}/clear-all")
    public ResponseEntity<?> clearAllNotifications(@PathVariable Long userId) {
        // Find existing notifications and delete them
        List<Notification> userNotifications = notificationRepo.findByRecipientIdOrderByCreatedAtDesc(userId);
        notificationRepo.deleteAll(userNotifications);
        
        // Also clear global ones for this session if needed? No, usually clear-all is per user.
        return ResponseEntity.ok("All notifications cleared");
    }
}
