package com.lostfound.controller;

import com.lostfound.dto.ClaimRequest;
import com.lostfound.entity.Claim;
import com.lostfound.service.ClaimService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    // 1️⃣ Raise claim
    @PostMapping
    public ResponseEntity<Claim> raiseClaim(@RequestBody ClaimRequest request) {
        return ResponseEntity.ok(claimService.raiseClaim(request));
    }

    // 2️⃣ View claims for owner
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Claim>> getOwnerClaims(@PathVariable Long ownerId) {
        return ResponseEntity.ok(claimService.getClaimsForOwner(ownerId));
    }

    // 3️⃣ Approve claim
    @PutMapping("/{id}/approve")
    public ResponseEntity<Claim> approveClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.approveClaim(id));
    }

    // 4️⃣ Reject claim
    @PutMapping("/{id}/reject")
    public ResponseEntity<Claim> rejectClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.rejectClaim(id));
    }
}