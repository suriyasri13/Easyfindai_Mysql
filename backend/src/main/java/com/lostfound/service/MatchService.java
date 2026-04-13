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

import com.lostfound.entity.*;
import com.lostfound.repository.*;

@Service
public class MatchService {

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


    // Use the exact path your ItemController uses for saving files
    private final String UPLOAD_DIR = "C:/Users/HP/OneDrive/Desktop/smart-lost-found-system-main - Copy/backend/uploads/";

    public List<Match> findMatches() {

        List<LostItem> lostItems = lostRepo.findByStatus("PENDING");
        List<FoundItem> foundItems = foundRepo.findByStatus("PENDING");

        List<Match> matches = new ArrayList<>();

        for (LostItem lost : lostItems) {
            for (FoundItem found : foundItems) {

            	boolean isMatch = false;
                double confidenceScore = 0.0;

                // Start AI Evaluation Process
                if (lost.getImagePath() != null && found.getImagePath() != null) {
                    try {
                        File lostImage = new File(UPLOAD_DIR + lost.getImagePath());
                        File foundImage = new File(UPLOAD_DIR + found.getImagePath());

                        if (lostImage.exists() && foundImage.exists()) {
                            // Hit Python ML service
                            String jsonResponse = aiService.callAI(
                                lostImage, 
                                foundImage, 
                                lost.getDescription() != null ? lost.getDescription() : lost.getItemName(), 
                                found.getDescription() != null ? found.getDescription() : found.getItemName()
                            );

                            JsonNode root = objectMapper.readTree(jsonResponse);
                            if (root.has("final_score")) {
                                confidenceScore = root.get("final_score").asDouble();
                                double imageScore = root.path("image_score").asDouble();
                                double textScore = root.path("text_score").asDouble();
                                
                                List<String> reasons = new ArrayList<>();
                                if (imageScore > 0.8) reasons.add("High visual similarity");
                                else if (imageScore > 0.5) reasons.add("AI visual similarity");
                                
                                if (textScore > 0.8) reasons.add("Strong description match");
                                else if (textScore > 0.5) reasons.add("Deep text similarity");

                                String combinedReason = reasons.isEmpty() ? "AI visual & text similarity" : String.join(", ", reasons);
                                System.out.println("DEBUG: Comparing Lost(" + lost.getItemName() + ") and Found(" + found.getItemName() + ") -> Confidence: " + confidenceScore);

                                // Lowering threshold to 0.45 for better discovery of matches like "phone"
                                if (confidenceScore > 0.45 || (textScore > 0.9 && imageScore > 0.3)) {
                                    saveMatchAndNotify(lost, found, confidenceScore, combinedReason);
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("AI Service unavailable. Falling back to text matching. (Error: " + e.getMessage() + ")");
                        // Fallback strictly to text matching if AI crashes
                        boolean nameMatch = lost.getItemName() != null && found.getItemName() != null &&
                                  lost.getItemName().trim().equalsIgnoreCase(found.getItemName().trim());
                        boolean categoryMatch = lost.getCategory() != null && found.getCategory() != null &&
                                  lost.getCategory().equalsIgnoreCase(found.getCategory());
                        
                        if (nameMatch && categoryMatch) {
                            saveMatchAndNotify(lost, found, 0.80, "Exact name & category match");
                        }
                    }
                } else {
                    // Fallback to text matching if images are missing
                    boolean nameMatch = lost.getItemName() != null && found.getItemName() != null &&
                              lost.getItemName().trim().equalsIgnoreCase(found.getItemName().trim());
                    
                    if (nameMatch) {
                        saveMatchAndNotify(lost, found, 0.55, "Identical item name");
                    }
                }
            }
        }
        return matchRepo.findAll();
    }
    
    public void processNewFoundItem(FoundItem found) {
        System.out.println("AI BROADCAST: New FOUND item reported - scanning all lost reports...");
        
        // --- 1. GLOBAL PUBLIC BROADCAST ---
        Notification globalAlert = new Notification();
        globalAlert.setRecipientId(0L); // Special ID for EVERYONE
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
        // Skip scanning own items
        if (lost.getUser().getUserId().equals(found.getFinder().getUserId())) return;

        double confidenceScore = 0.0;
        boolean isMatch = false;
        String combinedReason = "AI visual & text similarity";

        // 1. Instant Name Match for testing (Case Insensitive & Contains)
        String lostName = lost.getItemName().toLowerCase().trim();
        String foundName = found.getItemName().toLowerCase().trim();
        
        if (lostName.contains(foundName) || foundName.contains(lostName)) {
            System.out.println("AI INFO: Potential name match found: " + lostName + " <-> " + foundName);
            isMatch = true;
            confidenceScore = 0.8;
            combinedReason = "Item names are very similar";
        }

        // 2. AI Visual Comparison
        if (lost.getImagePath() != null && found.getImagePath() != null && !isMatch) {
            try {
                File lostImage = new File(UPLOAD_DIR + lost.getImagePath());
                File foundImage = new File(UPLOAD_DIR + found.getImagePath());

                if (lostImage.exists() && foundImage.exists()) {
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

                        if (confidenceScore > 0.45 || (textScore > 0.9 && imageScore > 0.3)) {
                            isMatch = true;
                        }
                    }
                }
            } catch (Exception e) {
                // Fallback to basic match if AI fails
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

        System.out.println("AI ACTION: Creating Match between LostId:" + lost.getItemId() + " and FoundId:" + found.getItemId());
        
        Match match = new Match();
        match.setLostItem(lost);
        match.setFoundItem(found);
        match.setStatus("PENDING");
        match.setConfidenceScore(confidence);
        match.setMatchReason(reason);
        match = matchRepo.save(match);

        // --- 1. NOTIFY LOST OWNER ---
        notifyUser(lost.getUser().getUserId(), match.getMatchId(), "We found an item that might be your lost " + lost.getItemName() + "!");
        
        // --- 2. NOTIFY FINDER ---
        notifyUser(found.getFinder().getUserId(), match.getMatchId(), "Your found item '" + found.getItemName() + "' matches a lost report!");

        // --- 3. SEND DUAL EMAILS (Uncomment once credentials are set in application.properties) ---
        // emailService.sendMatchAlert(lost.getUser().getEmail(), lost.getUser().getName(), lost.getItemName());
        // emailService.sendMatchAlert(found.getFinder().getEmail(), found.getFinder().getName(), found.getItemName());
        
        System.out.println("AI INFO: Notifications & Dual Emails pushed for match: " + lost.getItemName());
    }

    private void notifyUser(Long userId, Long matchId, String message) {
        Notification notification = new Notification();
        notification.setRecipientId(userId);
        notification.setMatchId(matchId);
        notification.setType("MATCH");
        notification.setTitle("New Potential Match!");
        notification.setMessage(message);
        notification.setActionText("View Match");
        notification.setActionUrl("/dashboard/match-results");
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


