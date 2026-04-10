package com.lostfound.dto;

public class ClaimRequest {

    private Long lostItemId;
    private Long foundItemId;
    private Long claimantUserId;
    private String proofDescription;

    public Long getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(Long lostItemId) {
        this.lostItemId = lostItemId;
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Long foundItemId) {
        this.foundItemId = foundItemId;
    }

    public Long getClaimantUserId() {
        return claimantUserId;
    }

    public void setClaimantUserId(Long claimantUserId) {
        this.claimantUserId = claimantUserId;
    }

    public String getProofDescription() {
        return proofDescription;
    }

    public void setProofDescription(String proofDescription) {
        this.proofDescription = proofDescription;
    }
}