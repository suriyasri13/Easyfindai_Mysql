import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from utils.matcher import nlp_model

# Define our semantic intents and their corresponding answers
INTENTS = [
    {
        "id": "report_lost",
        "phrases": [
            "I lost my wallet", 
            "my wallet lost", 
            "I dropped my keys somewhere", 
            "I can't find my phone", 
            "how to report a missing item",
            "I lost something"
        ],
        "response": 'To report a lost item:\n1. Click "Report Item" in the navigation.\n2. Select "Report Lost Item".\n3. Fill in details & upload a clear photo.\n4. Submit.\n\nYour item will instantly enter our AI queue to be matched with found items!'
    },
    {
        "id": "report_found",
        "phrases": [
            "I found a wallet", 
            "I picked up some keys on the street", 
            "how to report found item", 
            "someone lost their bag here",
            "I have someone's phone"
        ],
        "response": 'To report a found item:\n1. Click "Report Item".\n2. Select "Report Found Item".\n3. Add your contact info & the item\'s location.\n4. Submit.\n\nThe system will match it directly with pending lost item reports!'
    },
    {
        "id": "how_matching_works",
        "phrases": [
            "how does matching work", 
            "what is the AI doing", 
            "how do you find my item",
            "does the AI check images"
        ],
        "response": 'Our ML engine runs visual and textual comparisons using Deep Learning. When a holistic similarity score goes above 45%, we instantly notify both parties in real-time!'
    },
    {
        "id": "claim_item",
        "phrases": [
            "how to claim my item", 
            "how do I contact the finder", 
            "get my stuff back",
            "I got a match now what"
        ],
        "response": 'When you get a Match Notification, hit "View Match" or navigate to your Match Results. From there, you can open a secure real-time Chat to safely coordinate a meetup with the finder.'
    },
    {
        "id": "location_help",
        "phrases": [
            "why do you need my location", 
            "how does gps work", 
            "location services"
        ],
        "response": 'Hit "Enable Current Location" in the report form to auto-fill your GPS coordinates. This drastically improves local matching accuracy!'
    },
    {
        "id": "support",
        "phrases": [
            "I need help", 
            "how to contact support", 
            "talk to a human",
            "customer service"
        ],
        "response": 'We are here to help!\n📞 Phone: +1 800 555 0199\n📧 Email: help@easefind.ai\n📍 Address: 100 ML Campus Rd.'
    }
]

print("Compiling Semantic Chat Vectors...")

# Pre-compute embeddings for all intent phrases to keep inference fast
embedded_intents = []
for intent in INTENTS:
    vecs = nlp_model.encode(intent["phrases"])
    embedded_intents.append({
        "intent": intent,
        "embeddings": vecs
    })

print("Chat Engine Online.")

def get_smart_response(user_query: str) -> str:
    if not user_query.strip():
        return "Please ask a question."
        
    query_vec = nlp_model.encode([user_query])
    
    best_score = 0.0
    best_response = None
    
    for ei in embedded_intents:
        # Calculate similarity between user query and all phrases in this intent
        scores = cosine_similarity(query_vec, ei["embeddings"])[0]
        max_intent_score = max(scores)
        
        if max_intent_score > best_score:
            best_score = max_intent_score
            best_response = ei["intent"]["response"]
            
    print(f"CHAT_ENGINE -> Query: '{user_query}' | Confidence: {best_score}")
    
    # Threshold for semantic match
    if best_score > 0.45:
        return best_response
        
    return 'I wasn\'t quite sure what you meant. I can help you with:\n• Reporting lost/found items\n• Understanding AI tracking\n• Claiming matches\n\nCould you rephrase your question?'
