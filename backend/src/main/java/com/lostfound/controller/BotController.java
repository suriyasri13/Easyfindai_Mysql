package com.lostfound.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chatbot")

public class BotController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @org.springframework.beans.factory.annotation.Value("${AI_SERVER_URL:http://localhost:5000}")
    private String aiServerUrl;

    @PostMapping("/ask")
    public ResponseEntity<?> askChatBot(@RequestBody Map<String, String> requestData) {
        try {
            String query = requestData.get("query");
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("response", "Query cannot be empty"));
            }

            // Map request for Python endpoint
            Map<String, String> pythonRequest = new HashMap<>();
            pythonRequest.put("query", query);

            // POST to Python
            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(aiServerUrl + "/chat", pythonRequest, Map.class);
            return ResponseEntity.ok(aiResponse.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback response if Python is down
            return ResponseEntity.ok(Map.of("response", "Our AI service is currently restarting. I can still help you with:\n• Reporting items\n• Understanding AI tracking\n• Claiming matches\n\nPlease try again in a few moments!"));
        }
    }
}
