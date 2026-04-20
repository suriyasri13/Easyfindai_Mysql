package com.lostfound.service;

import java.io.File;
import java.util.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lostfound.entity.*;
import com.lostfound.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
public class SmartMatchService {

    @Autowired
    private LostItemRepository lostRepo;

    @Autowired
    private FoundItemRepository foundRepo;

    @Autowired
    private MatchRepository matchRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AIService aiService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    private final String UPLOAD_DIR = "uploads/";

    public List<Match> findMatches() {
        List<LostItem> lostItems = lostRepo.findByStatus("PENDING");
        List<FoundItem> foundItems = foundRepo.findByStatus("PENDING");

        for (LostItem lost : lostItems) {
            for (FoundItem found : foundItems) {
                performMatchingLogic(lost, found);
            }
        }
        return matchRepo.findAll();
    }

    public List<Match> getMatchesForUser(Long userId) {
        return matchRepo.findByLostItemUserUserIdOrFoundItemFinderUserId(userId, userId);
    }
    
    public void processNewFoundItem(FoundItem found) {
        System.out.println("AI BROADCAST: New FOUND item reported - scanning all lost reports...");
        
        Notification globalAlert = new Notification();
        globalAlert.setRecipientId(0L); 
        globalAlert.setType("GLOBAL");
        globalAlert.setTitle("Public Notice: New Item Found!");
        globalAlert.setMessage("Someone just reported finding a '" + found.getItemName() + "' at '" + found.getLocation() + "'.");
        globalAlert.setActionText("View Items");
        globalAlert.setActionUrl("/dashboard/found-items");
        globalAlert.setCreatedAt(java.time.LocalDateTime.now());
        notificationRepo.save(globalAlert);
        messagingTemplate.convertAndSend("/topic/global", globalAlert);

        List<LostItem> lostItems = lostRepo.findAll();
        for (LostItem lost : lostItems) {
            performMatchingLogic(lost, found);
        }
    }

    public void processNewLostItem(LostItem lost) {
        System.out.println("AI BROADCAST: New LOST item reported - scanning all found items...");
        List<FoundItem> foundItems = foundRepo.findAll();
        for (FoundItem found : foundItems) {
            performMatchingLogic(lost, found);
        }
    }

    private void performMatchingLogic(LostItem lost, FoundItem found) {
        // --- NULL CHECKS ---
        if (lost == null || found == null) return;
        if (lost.getUser() == null || found.getFinder() == null) {
            System.err.println("AI: Skipping match check - one of the items has a null owner/finder.");
            return;
        }
        if (lost.getUser().getUserId().equals(found.getFinder().getUserId())) return;
        
        if (lost.getItemName() == null || found.getItemName() == null) {
            System.err.println("AI: Skipping match check - one of the items has a null name.");
            return;
        }

        double confidenceScore = 0.0;
        boolean isMatch = false;
        String combinedReason = "AI visual & text similarity";

        String lostName = lost.getItemName().toLowerCase().trim();
        String foundName = found.getItemName().toLowerCase().trim();
        
        if (lostName.contains(foundName) || foundName.contains(lostName)) {
            isMatch = true;
            confidenceScore = 0.8;
            combinedReason = "Item names are very similar";
        }

        if (!isMatch) {
            try {
                File lostImage = (lost.getImagePath() != null) ? new File(UPLOAD_DIR + lost.getImagePath()) : null;
                File foundImage = (found.getImagePath() != null) ? new File(UPLOAD_DIR + found.getImagePath()) : null;

                String jsonResponse = aiService.callAI(
                    lostImage, 
                    foundImage, 
                    lost.getDescription() != null ? lost.getDescription() : lost.getItemName(), 
                    found.getDescription() != null ? found.getDescription() : found.getItemName()
                );

                JsonNode root = objectMapper.readTree(jsonResponse);
                if (root.has("final_score")) {
                    confidenceScore = root.get("final_score").asDouble();
                    double textScore = root.path("text_score").asDouble();
                    double imageScore = root.path("image_score").asDouble();
                    
                    List<String> reasons = new ArrayList<>();
                    if (imageScore > 0.6) reasons.add("AI visual similarity");
                    if (textScore > 0.6) reasons.add("Matching descriptions");
                    combinedReason = reasons.isEmpty() ? "AI comparison" : String.join(", ", reasons);

                    if (confidenceScore > 0.45 || (textScore > 0.9)) {
                        isMatch = true;
                    }
                }
            } catch (Exception e) {
                if (lost.getItemName().equalsIgnoreCase(found.getItemName())) {
                    isMatch = true;
                    confidenceScore = 0.75;
                    combinedReason = "Exact name match";
                }
            }
        }
 else if (!isMatch) { // Fallback if no images
             if (lost.getItemName().equalsIgnoreCase(found.getItemName())) {
                isMatch = true;
                confidenceScore = 0.75;
                combinedReason = "Exact name match";
            }
        }

        if (isMatch) {
            saveMatchAndNotify(lost, found, confidenceScore, combinedReason);
        }
    }

    private void saveMatchAndNotify(LostItem lost, FoundItem found, double confidence, String reason) {
        if (matchRepo.existsByLostItemAndFoundItem(lost, found)) return;

        Match match = new Match();
        match.setLostItem(lost);
        match.setFoundItem(found);
        match.setStatus("PENDING");
        match.setConfidenceScore(confidence);
        match.setMatchReason(reason);
        
        String securityKey = (lost.getUniqueIdentifier() != null && !lost.getUniqueIdentifier().trim().isEmpty()) 
                ? lost.getUniqueIdentifier() : found.getUniqueIdentifier();
        if (securityKey == null || securityKey.trim().isEmpty()) {
            securityKey = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }
        match.setSecurityKey(securityKey);
        
        match = matchRepo.save(match);

        notifyUser(lost.getUser().getUserId(), match.getMatchId(), "We found an item that might be your lost " + lost.getItemName() + "! Security Key: " + match.getSecurityKey());
        notifyUser(found.getFinder().getUserId(), match.getMatchId(), "Your found item '" + found.getItemName() + "' matches a lost report! Security Key: " + match.getSecurityKey());

        try {
            emailService.sendMatchAlert(lost.getUser().getEmail(), lost.getUser().getName(), lost.getItemName(), match.getSecurityKey());
            emailService.sendMatchAlert(found.getFinder().getEmail(), found.getFinder().getName(), found.getItemName(), match.getSecurityKey());
        } catch (Exception e) {
            System.err.println("AI ERROR: Failed to send Gmail alerts: " + e.getMessage());
        }
    }

    private void notifyUser(Long userId, Long matchId, String message) {
        if (notificationRepo.existsByRecipientIdAndMatchIdAndType(userId, matchId, "MATCH")) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientId(userId);
        notification.setMatchId(matchId);
        notification.setType("MATCH");
        notification.setTitle("New Potential Match!");
        notification.setMessage(message);
        notification.setActionText("View Match");
        notification.setActionUrl("/dashboard/match-results?matchId=" + matchId);
        notification.setCreatedAt(java.time.LocalDateTime.now());
        notificationRepo.save(notification);
        messagingTemplate.convertAndSend("/topic/user_" + userId, notification);
    }

    public void confirmMatch(Long id) {
        Match match = matchRepo.findById(id).orElse(null);
        if (match != null) {
            match.setStatus("RESOLVED"); 
            matchRepo.save(match);

            LostItem lost = match.getLostItem();
            FoundItem found = match.getFoundItem();
            
            if (lost != null) {
                lost.setStatus("MATCHED");
                lostRepo.save(lost);
            }
            if (found != null) {
                found.setStatus("MATCHED");
                foundRepo.save(found);
            }
        }
    }

    public void deleteMatch(Long id) {
        Match match = matchRepo.findById(id).orElse(null);
        if (match != null) {
            LostItem lost = match.getLostItem();
            FoundItem found = match.getFoundItem();
            if (lost != null) {
                lost.setStatus("PENDING");
                lostRepo.save(lost);
            }
            if (found != null) {
                found.setStatus("PENDING");
                foundRepo.save(found);
            }
            matchRepo.delete(match);
        }
    }
}
