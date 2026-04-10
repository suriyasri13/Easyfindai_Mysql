package com.lostfound.service;


import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.lostfound.entity.LostItem;
import com.lostfound.repository.LostItemRepository;


@Service
public class LostItemService {


@Autowired
private LostItemRepository lostItemRepository;


public LostItem saveLostItem(LostItem item) {
return lostItemRepository.save(item);
}


public List<LostItem> getLostItemsByUser(Long userId) {
return lostItemRepository.findByUserUserId(userId);
}
public List<LostItem> getAllLostItems() {
    return lostItemRepository.findAll();
}
}