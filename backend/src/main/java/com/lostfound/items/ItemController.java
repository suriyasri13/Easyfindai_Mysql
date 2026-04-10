package com.lostfound.items;

import com.lostfound.entity.FoundItem;
import com.lostfound.entity.LostItem;
import com.lostfound.entity.User;
import com.lostfound.repository.UserRepository;
import com.lostfound.service.FoundItemService;
import com.lostfound.service.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private LostItemService lostItemService;

    @Autowired
    private FoundItemService foundItemService;

    @Autowired
    private UserRepository userRepository;

    // ---------------- LOST ITEMS ----------------

    @PostMapping(value = "/lost-items", consumes = "multipart/form-data")
    public ResponseEntity<?> addLostItemMultipart(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("contactInfo") String contactInfo,
            @RequestParam("dateLost") String dateLost,
            @RequestParam("location") String location,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            LostItem item = new LostItem();
            item.setItemName(itemName);
            item.setCategory(category);
            item.setDescription(description);
            item.setContactInfo(contactInfo);
            item.setLocation(location);
            item.setDateLost(LocalDate.parse(dateLost));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            item.setUser(user);

            if (image != null && !image.isEmpty()) {
                String fileName = saveImage(image);
                item.setImagePath(fileName);
            }

            return ResponseEntity.ok(lostItemService.saveLostItem(item));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving lost item: " + e.getMessage());
        }
    }

    @GetMapping("/lost-items")
    public List<LostItem> getAllLostItems() {
        return lostItemService.getAllLostItems();
    }

    // ---------------- FOUND ITEMS ----------------

    @PostMapping(value = "/found-items", consumes = "multipart/form-data")
    public ResponseEntity<?> addFoundItemMultipart(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("contactInfo") String contactInfo,
            @RequestParam("dateLost") String dateLost, // using same param name from frontend
            @RequestParam("location") String location,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            System.out.println("Backend: RECEIVED Found Item Report Request for " + itemName);
            FoundItem item = new FoundItem();
            item.setItemName(itemName);
            item.setCategory(category);
            item.setDescription(description);
            item.setContactInfo(contactInfo);
            item.setLocation(location);

            if (dateLost == null || dateLost.isBlank()) {
                item.setDateFound(LocalDate.now());
            } else {
                item.setDateFound(LocalDate.parse(dateLost));
            }
            item.setStatus("PENDING");

            User finder = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            item.setFinder(finder);

            if (image != null && !image.isEmpty()) {
                String fileName = saveImage(image);
                item.setImagePath(fileName);
            }

            FoundItem savedItem = foundItemService.save(item);
            System.out.println("Backend: SUCCESS saving Found Item Id: " + savedItem.getItemId());
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving found item: " + e.getMessage());
        }
    }

    @GetMapping("/found-items")
    public List<FoundItem> getAllFoundItems() {
        return foundItemService.getAll();
    }

    // ---------------- HELPERS ----------------

    private String saveImage(MultipartFile image) throws Exception {
        String uploadDir = "C:/Users/HP/OneDrive/Desktop/smart-lost-found-system-main/backend/uploads/";
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs();
        }
        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        File file = new File(uploadDir + fileName);
        image.transferTo(file);
        return fileName;
    }
}
