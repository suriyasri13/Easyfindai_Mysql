package com.lostfound.service;

import com.lostfound.entity.FoundItem;
import com.lostfound.repository.FoundItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoundItemService {

    @Autowired
    private FoundItemRepository foundItemRepository;

    public FoundItem save(FoundItem item) {
        return foundItemRepository.save(item);
    }

    public List<FoundItem> getAll() {
        return foundItemRepository.findAll();
    }
}
