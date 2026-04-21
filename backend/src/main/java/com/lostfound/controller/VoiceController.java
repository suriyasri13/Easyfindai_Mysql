package com.lostfound.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*")
public class VoiceController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_VOICE_URL = "http://localhost:5000/voice";

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

            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(PYTHON_VOICE_URL, pythonRequest, Map.class);
            return ResponseEntity.ok(aiResponse.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Local AI service is offline. Please ensure Python AI server is running."));
        }
    }
}
