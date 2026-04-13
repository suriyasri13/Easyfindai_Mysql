package com.lostfound.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "found_items")
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @Column(nullable = false)
    private String itemName;
    private String color;
    private String location;
    private LocalDate dateFound;

    private String imagePath;
    
    @Column(nullable = false)
    private String status ="PENDING"; // PENDING / MATCHED / RETURNED

    private String category;
    private String description;
    private String contactInfo;

    // Many found items belong to one user (finder)
    @ManyToOne
    @JoinColumn(name = "finder_id", nullable = false)
    private User finder;
    // getters & setters
    
    
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

    public LocalDate getDateFound() {
        return dateFound;
    }

    public void setDateFound(LocalDate dateFound) {
        this.dateFound = dateFound;
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

    public User getFinder() {
        return finder;
    }

    public void setFinder(User finder) {
        this.finder = finder;
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
