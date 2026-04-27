package com.lostfound.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/voice")

public class VoiceController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @org.springframework.beans.factory.annotation.Value("${AI_SERVER_URL:http://localhost:5000}")
    private String aiServerUrl;

    @PostMapping("/parse")
    public ResponseEntity<?> parseVoiceText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No text provided"));
        }

        try {
            // Forward to Python AI service
            Map<String, String> pythonRequest = new HashMap<>();
            pythonRequest.put("text", text);

            System.out.println("VOICE_AI -> Forwarding request to: " + aiServerUrl + "/voice");
            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(aiServerUrl + "/voice", pythonRequest, Map.class);
            return ResponseEntity.ok(aiResponse.getBody());

        } catch (Exception e) {
            System.err.println("VOICE_AI_ERROR: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "error", "AI Service Connection Failed",
                "details", e.getMessage(),
                "suggestion", "Check if " + aiServerUrl + " is online. Ensure your laptop can reach the internet."
            ));
        }
    }

    @PostMapping("/verify-image")
    public ResponseEntity<?> verifyImage(@RequestParam("image") org.springframework.web.multipart.MultipartFile image) {
        try {
            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("image", image.getResource());

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = 
                new org.springframework.http.HttpEntity<>(body, new org.springframework.http.HttpHeaders());

            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(aiServerUrl + "/verify-image", requestEntity, Map.class);
            return ResponseEntity.ok(aiResponse.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Image verification service offline: " + e.getMessage()));
        }
    }
}
