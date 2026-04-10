package com.lostfound.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.MatchRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private LostItemRepository lostItemRepository;
    @Autowired
    private FoundItemRepository foundItemRepository;
    
    @Autowired
    private MatchRepository matchRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {

        Map<String, Object> stats = new HashMap<>();

        long lost = lostItemRepository.count(); // counts lost items
        long found = foundItemRepository.count();
        double successRate = found == 0 ? 0 : ((double) found / lost) * 100;
        long matches = matchRepository.count();

        stats.put("lost", lost);
        stats.put("found", found);      // you don't have FoundItem entity yet
        stats.put("matches", matches);    // match system not added yet
        stats.put("successRate", successRate);

        return stats;
    }
}