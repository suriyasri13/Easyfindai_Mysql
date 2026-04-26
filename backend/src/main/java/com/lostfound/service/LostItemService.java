package com.lostfound.service;


import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.lostfound.entity.LostItem;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.MatchRepository;
import com.lostfound.repository.ClaimRepository;
import org.springframework.transaction.annotation.Transactional;


@Service
public class LostItemService {

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ClaimRepository claimRepository;

    public LostItem saveLostItem(LostItem item) {
        return lostItemRepository.save(item);
    }


public List<LostItem> getLostItemsByUser(Long userId) {
return lostItemRepository.findByUserUserId(userId);
}
public List<LostItem> getAllLostItems() {
    return lostItemRepository.findAll();
}

    @Transactional
    public void deleteLostItem(Long id) {
        matchRepository.deleteByLostItemItemId(id);
        claimRepository.deleteByLostItemItemId(id);
        lostItemRepository.deleteById(id);
    }
}
