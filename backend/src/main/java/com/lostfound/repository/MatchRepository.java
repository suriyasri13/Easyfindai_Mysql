package com.lostfound.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lostfound.entity.Match;
import com.lostfound.entity.LostItem;
import com.lostfound.entity.FoundItem;

public interface MatchRepository extends JpaRepository<Match, Long> {

    boolean existsByLostItemAndFoundItem(LostItem lostItem, FoundItem foundItem);
}
