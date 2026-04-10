import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

def text_similarity(text1, text2):

    if not text1 or not text2:
        return 0.0

    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform([text1, text2])

    score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]

    return round(float(score), 2)


def match_items(lost_vector, found_vector):

    # Safety check
    if lost_vector is None or found_vector is None:
        return 0.0

    lost = np.array(lost_vector).reshape(1, -1)
    found = np.array(found_vector).reshape(1, -1)

    score = cosine_similarity(lost, found)[0][0]

    return round(float(score), 2)
