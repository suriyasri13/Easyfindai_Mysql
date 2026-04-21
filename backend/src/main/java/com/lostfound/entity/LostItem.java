package com.lostfound.entity;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lost_items")
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @Column(nullable = false)
    private String itemName;

    private String color;
    private String location;
    
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateLost;
    
    private String imagePath;

    @Column(nullable = false)
    private String status = "PENDING"; // MATCHED / PENDING / REJECTED
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String category;
    private String description;
    
    private LocalDateTime createdAt;

	private String contactInfo;

    public LostItem() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getItemId() { 
    	return itemId; 
    	}
    
    public void setItemId(Long itemId) { 
    	this.itemId = itemId; 
    	}

    public String getItemName() { 
    	return itemName; 
    	}
    public void setItemName(String itemName) { 
    	this.itemName = itemName; 
    	}

    public String getColor() { 
    	return color; 
    	}
    
    public void setColor(String color) { 
    	this.color = color; 
    	}

    public String getLocation() { 
    	return location; 
    	}
    
    public void setLocation(String location) { 
    	this.location = location; 
    	}

    public LocalDate getDateLost() { 
    	return dateLost; 
    	}
    
    public void setDateLost(LocalDate dateLost) { 
    	this.dateLost = dateLost; 
    	}

    public String getImagePath() { 
    	return imagePath; 
    	}
    
    public void setImagePath(String imagePath) { 
    	this.imagePath = imagePath; 
    	}

    public String getStatus() { 
    	return status; 
    	}
    
    public void setStatus(String status) { 
    	this.status = status; 
    	}

    public User getUser() { 
    	return user; 
    	}
    public void setUser(User user) { 
    	this.user = user; 
    	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getContactInfo() {
		return contactInfo;
	}

	public void setContactInfo(String contactInfo) {
		this.contactInfo = contactInfo;
	}

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

	private boolean isConfidential = false;
	private String uniqueIdentifier;
	private String hiddenDetail;

	public boolean isConfidential() { return isConfidential; }
	public void setConfidential(boolean confidential) { isConfidential = confidential; }
	public String getUniqueIdentifier() { return uniqueIdentifier; }
	public void setUniqueIdentifier(String uniqueIdentifier) { this.uniqueIdentifier = uniqueIdentifier; }
	public String getHiddenDetail() { return hiddenDetail; }
	public void setHiddenDetail(String hiddenDetail) { this.hiddenDetail = hiddenDetail; }
}
