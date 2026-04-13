package com.lostfound.controller;

import com.lostfound.entity.*;
import com.lostfound.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private MatchRepository matchRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 1. Get messages for a match (and trigger AI Bot if empty)
    @GetMapping("/{matchId}")
    public List<ChatMessage> getMessages(@PathVariable Long matchId) {
        List<ChatMessage> messages = chatMessageRepo.findByMatchIdOrderByTimestampAsc(matchId);
        
        // --- AI MODERATOR TRIGGER ---
        if (messages.isEmpty()) {
            Match match = matchRepo.findById(matchId).orElse(null);
            if (match != null) {
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    Map<String, String> payload = new HashMap<>();
                    payload.put("lost_desc", match.getLostItem().getDescription());
                    payload.put("found_desc", match.getFoundItem().getDescription());
                    
                    ResponseEntity<Map> response = restTemplate.postForEntity("http://localhost:5000/moderate", payload, Map.class);
                    String botMessage = (String) response.getBody().get("message");
                    
                    ChatMessage botChat = new ChatMessage();
                    botChat.setMatchId(matchId);
                    botChat.setSenderId(0L); // 0 identifies the AI bot
                    botChat.setContent(botMessage);
                    botChat.setTimestamp(LocalDateTime.now());
                    chatMessageRepo.save(botChat);
                    
                    messages.add(botChat);
                } catch (Exception e) {
                    System.err.println("AI Moderator unavailable: " + e.getMessage());
                }
            }
        }
        
        return messages;
    }

    // 2. Send a new message
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessage message) {
        try {
            message.setTimestamp(LocalDateTime.now());
            ChatMessage saved = chatMessageRepo.save(message);

            // --- REAL-TIME CHAT WEBSOCKET RELAY ---
            messagingTemplate.convertAndSend("/topic/chat_" + message.getMatchId(), saved);

            // --- NOTIFICATION TRIGGER ---
            Match match = matchRepo.findById(message.getMatchId()).orElse(null);
            User sender = userRepo.findById(message.getSenderId()).orElse(null);

            if (match != null && sender != null) {
                Long recipientId;
                if (message.getSenderId().equals(match.getLostItem().getUser().getUserId())) {
                    recipientId = match.getFoundItem().getFinder().getUserId();
                } else {
                    recipientId = match.getLostItem().getUser().getUserId();
                }

                Notification notification = new Notification();
                notification.setRecipientId(recipientId);
                notification.setMatchId(match.getMatchId());
                notification.setType("CHAT");
                notification.setTitle("New Message from " + sender.getName());
                notification.setMessage(sender.getName() + " sent you a message about: " + match.getLostItem().getItemName());
                notification.setActionText("Reply");
                notification.setActionUrl("/dashboard/match-results");
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepo.save(notification);
                messagingTemplate.convertAndSend("/topic/user_" + recipientId, notification);
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending message: " + e.getMessage());
        }
    }
}
