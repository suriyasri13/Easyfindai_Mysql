import re
from utils.matcher import nlp_model
from sklearn.metrics.pairwise import cosine_similarity

CATEGORIES = [
    'Electronics', 'Personal Items', 'Documents', 'Accessories', 
    'Clothing', 'Keys', 'Bags', 'Jewelry', 'Other'
]

LOCATIONS = [
    'Classroom', 'Library', 'Canteen', 'Laboratory', 
    'Hostel', 'Sports Ground', 'Main Gate', 'Others'
]

def parse_voice_transcript(text):
    text_lower = text.lower()
    
    # Identify itemType
    item_type = "found" if "found" in text_lower or "picked up" in text_lower else "lost"
    
    # Extract Category using Semantic Similarity
    cat_embeddings = nlp_model.encode(CATEGORIES)
    text_embedding = nlp_model.encode([text])
    cat_scores = cosine_similarity(text_embedding, cat_embeddings)[0]
    best_cat_idx = cat_scores.argmax()
    category = CATEGORIES[best_cat_idx] if cat_scores[best_cat_idx] > 0.3 else "Other"
    
    # Extract Location using Semantic Similarity
    loc_embeddings = nlp_model.encode(LOCATIONS)
    loc_scores = cosine_similarity(text_embedding, loc_embeddings)[0]
    best_loc_idx = loc_scores.argmax()
    location = LOCATIONS[best_loc_idx] if loc_scores[best_loc_idx] > 0.3 else "Others"
    
    # Simple Item Name extraction (look for common patterns)
    # Pattern: "found a [item]" or "lost my [item]"
    item_name = "Item"
    patterns = [
        r"(?:found|lost|lost my|found a|picked up a|saw a) ([\w\s]+) (?:near|at|in|on|around)",
        r"(?:found|lost|lost my|found a|picked up a|saw a) ([\w\s]+)$"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            item_name = match.group(1).strip().capitalize()
            break
            
    if item_name == "Item":
        # Fallback: first 3 words after 'found' or 'lost'
        words = text_lower.split()
        for i, word in enumerate(words):
            if word in ["found", "lost"]:
                if i + 1 < len(words):
                    item_name = " ".join(words[i+1:i+3]).capitalize()
                    break

    return {
        "itemName": item_name,
        "category": category,
        "description": f"Voice reported: {text}",
        "location": location,
        "itemType": item_type
    }
