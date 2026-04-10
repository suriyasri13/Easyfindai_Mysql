package com.lostfound.controller;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import com.lostfound.entity.Match;
import com.lostfound.service.MatchService;
import com.lostfound.service.AIService;

@RestController
@RequestMapping("/api/match")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private AIService aiService;   // ✅ Inject AI service

    // 1️⃣ Existing endpoint
    @GetMapping
    public List<Match> getMatches() {
        return matchService.findMatches();
    }

    // 2️⃣ NEW AI endpoint
    @PostMapping("/check")
    public ResponseEntity<?> checkMatch(
            @RequestParam("lostImage") MultipartFile lostImage,
            @RequestParam("foundImage") MultipartFile foundImage,
            @RequestParam("lostDescription") String lostDescription,
            @RequestParam("foundDescription") String foundDescription
    ) throws Exception {

    	File lostFile = null;
    	File foundFile = null;

    	try {
    	    lostFile = File.createTempFile("lost-", ".jpg");
    	    lostImage.transferTo(lostFile);

    	    foundFile = File.createTempFile("found-", ".jpg");
    	    foundImage.transferTo(foundFile);

    	    String result = aiService.callAI(
    	            lostFile,
    	            foundFile,
    	            lostDescription,
    	            foundDescription
    	    );

    	    return ResponseEntity.ok(result);

    	} finally {
    	    if (lostFile != null) lostFile.delete();
    	    if (foundFile != null) foundFile.delete();
    	}
    }
}
