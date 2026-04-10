package com.lostfound.repository;

import com.lostfound.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByOwnerUserId(Long ownerUserId);

    List<Claim> findByClaimantUserId(Long claimantUserId);
}
