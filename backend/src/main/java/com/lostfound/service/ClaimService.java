package com.lostfound.service;

import com.lostfound.dto.ClaimRequest;
import com.lostfound.entity.Claim;
import com.lostfound.entity.FoundItem;
import com.lostfound.entity.LostItem;
import com.lostfound.entity.User;
import com.lostfound.enums.ClaimStatus;
import com.lostfound.repository.ClaimRepository;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;

    public ClaimService(ClaimRepository claimRepository,
                        LostItemRepository lostItemRepository,
                        FoundItemRepository foundItemRepository,
                        UserRepository userRepository) {

        this.claimRepository = claimRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
    }

    // 🔥 FIXED VERSION
    public Claim raiseClaim(ClaimRequest request) {

        LostItem lostItem = lostItemRepository.findById(request.getLostItemId())
                .orElseThrow(() -> new RuntimeException("Lost item not found"));

        FoundItem foundItem = foundItemRepository.findById(request.getFoundItemId())
                .orElseThrow(() -> new RuntimeException("Found item not found"));

        User claimant = userRepository.findById(request.getClaimantUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Claim claim = new Claim();
        claim.setLostItem(lostItem);
        claim.setFoundItem(foundItem);   // ✅ THIS FIXES NULL ERROR
        claim.setClaimantUserId(claimant.getUserId());
        claim.setOwnerUserId(lostItem.getUser().getUserId());
        claim.setProofDescription(request.getProofDescription());
        claim.setStatus(ClaimStatus.PENDING);

        return claimRepository.save(claim);
    }

    public List<Claim> getClaimsForOwner(Long ownerId) {
        return claimRepository.findByOwnerUserId(ownerId);
    }

    public Claim approveClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(ClaimStatus.APPROVED);
        return claimRepository.save(claim);
    }

    public Claim rejectClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(ClaimStatus.REJECTED);
        return claimRepository.save(claim);
    }
}