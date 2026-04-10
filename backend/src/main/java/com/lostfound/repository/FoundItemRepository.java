package com.lostfound.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lostfound.entity.FoundItem;


public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {

    List<FoundItem> findByFinder_UserId(Long userId);

    List<FoundItem> findByStatus(String status);

}
