import re

STOP_WORDS = {"this", "that", "with", "have", "some", "very", "found", "lost", "item", "black", "white", "color", "there", "their", "they", "about", "which"}

def generate_security_script(lost_desc, found_desc):
    # Handle None types gracefully if descriptions are empty
    lost_desc = lost_desc if lost_desc is not None else ""
    found_desc = found_desc if found_desc is not None else ""
    
    # Extract words longer than 3 characters
    words1 = set(re.findall(r'\b[a-zA-Z]{4,}\b', lost_desc.lower()))
    words2 = set(re.findall(r'\b[a-zA-Z]{4,}\b', found_desc.lower()))
    
    # Intersect to find common traits, exclude generic stop words
    common = words1.intersection(words2) - STOP_WORDS
    
    if common:
        traits = ", ".join(list(common)[:3])
        return f"I am the EaseFind Security Bot 🤖 I noticed these items share traits like [{traits}]. To prevent scams, safely ask the claimant to verify a hidden detail before agreeing to meet!"
        
    return "I am the EaseFind Security Bot 🤖 Please ensure you verify specific, hidden details about this item with the claimant to prevent scams before agreeing to meet in person!"
