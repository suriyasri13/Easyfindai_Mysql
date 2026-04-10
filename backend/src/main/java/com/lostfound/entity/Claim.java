package com.lostfound.entity;

import com.lostfound.enums.ClaimStatus;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;

    @Column(length = 500)
    private String proofDescription;

    private LocalDateTime createdAt;

    // One claim belongs to one lost item
    @OneToOne
    @JoinColumn(name = "lost_item_id", nullable = false)
    private LostItem lostItem;

    // One claim belongs to one found item
    @OneToOne
    @JoinColumn(name = "found_item_id", nullable = false)
    private FoundItem foundItem;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = ClaimStatus.PENDING;
    }
    
    @Column(name = "claimant_user_id", nullable = false)
    private Long claimantUserId;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;
    
    // -------- Getters & Setters --------

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }
    
    public LostItem getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItem lostItem) {
        this.lostItem = lostItem;
    }

    public FoundItem getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItem foundItem) {
        this.foundItem = foundItem;
    }
    
    public Long getClaimantUserId() {
        return claimantUserId;
    }

    public void setClaimantUserId(Long claimantUserId) {
        this.claimantUserId = claimantUserId;
    }

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(Long ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getProofDescription() {
        return proofDescription;
    }

    public void setProofDescription(String proofDescription) {
        this.proofDescription = proofDescription;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
