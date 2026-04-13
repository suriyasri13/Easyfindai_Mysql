import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

print("Loading SentenceTransformer NLP Model 'all-MiniLM-L6-v2'...")
nlp_model = SentenceTransformer('all-MiniLM-L6-v2')
print("NLP Model loaded successfully.")

def deep_text_similarity(text1, text2):
    if not text1 or not text2:
        return 0.0

    emb1 = nlp_model.encode([text1])
    emb2 = nlp_model.encode([text2])
    
    score = cosine_similarity(emb1, emb2)[0][0]
    return round(float(score), 2)

def match_image_features(lost_vector, found_vector):
    if lost_vector is None or found_vector is None:
        return 0.0

    lost = np.array(lost_vector).reshape(1, -1)
    found = np.array(found_vector).reshape(1, -1)

    score = cosine_similarity(lost, found)[0][0]
    return round(float(score), 2)
