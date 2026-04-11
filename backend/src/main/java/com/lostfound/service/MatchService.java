package com.lostfound.service;

import java.io.File;
import java.util.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    private AIService aiService;

    @Autowired
    private ObjectMapper objectMapper;

    // Use the exact path your ItemController uses for saving files
    private final String UPLOAD_DIR = "C:/Users/HP/OneDrive/Desktop/smart-lost-found-system-main/backend/uploads/";

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
                                // Any confidence strictly higher than 50% constitutes an AI Match
                                if (confidenceScore > 0.50) {
                                    isMatch = true;
                                }
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        // Fallback strictly to text matching if AI crashes
                        boolean nameMatch = lost.getItemName() != null && found.getItemName() != null &&
                                  lost.getItemName().trim().equalsIgnoreCase(found.getItemName().trim());
                        boolean categoryMatch = lost.getCategory() != null && found.getCategory() != null &&
                                  lost.getCategory().equalsIgnoreCase(found.getCategory());
                        
                        if (nameMatch && categoryMatch) {
                            isMatch = true;
                            confidenceScore = 0.75; // 75% for strong text match
                        } else if (nameMatch) {
                            isMatch = true;
                            confidenceScore = 0.55; // 55% for weak text match
                        }
                    }
                } else {
                    // Fallback to text matching if images are missing
                    boolean nameMatch = lost.getItemName() != null && found.getItemName() != null &&
                              lost.getItemName().trim().equalsIgnoreCase(found.getItemName().trim());
                    boolean categoryMatch = lost.getCategory() != null && found.getCategory() != null &&
                              lost.getCategory().equalsIgnoreCase(found.getCategory());
                    
                    if (nameMatch && categoryMatch) {
                        isMatch = true;
                        confidenceScore = 0.75; // 75% for strong text match
                    } else if (nameMatch) {
                        isMatch = true;
                        confidenceScore = 0.55; // 55% for weak text match
                    }
                }

                if (isMatch && !matchRepo.existsByLostItemAndFoundItem(lost, found)) {

                    Match match = new Match();
                    match.setLostItem(lost);
                    match.setFoundItem(found);
                    match.setStatus("MATCHED");
                    // Use the newly calculated fallback score, or default to 0.50 if something goes wrong
                    match.setConfidenceScore(confidenceScore > 0 ? confidenceScore : 0.50);

                    matches.add(matchRepo.save(match));

                    lost.setStatus("MATCHED");
                    found.setStatus("MATCHED");

                    lostRepo.save(lost);
                    foundRepo.save(found);
                }
            }
        }
        return matchRepo.findAll();
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


