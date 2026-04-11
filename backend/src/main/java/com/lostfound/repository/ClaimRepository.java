package com.lostfound.repository;

import com.lostfound.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByOwnerUserId(Long ownerUserId);

    List<Claim> findByClaimantUserId(Long claimantUserId);

    @Transactional
    @Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Claim c WHERE c.lostItem.itemId = :itemId")
    void deleteByLostItemItemId(Long itemId);

    @Transactional
    @Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Claim c WHERE c.foundItem.itemId = :itemId")
    void deleteByFoundItemItemId(Long itemId);
}
