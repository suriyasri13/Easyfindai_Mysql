package com.lostfound.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.lostfound.entity.LostItem;


public interface LostItemRepository extends JpaRepository<LostItem, Long> {
	List<LostItem> findByUserUserId(Long userId);
	
	List<LostItem> findByStatus(String status);
	
}