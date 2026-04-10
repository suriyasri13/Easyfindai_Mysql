import cv2
import numpy as np

def extract_features(image_path):

    image = cv2.imread(image_path)

    # Safety check
    if image is None:
        return None

    image = cv2.resize(image, (224,224))

    # Optional but recommended
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    hist = cv2.calcHist(
        [image],
        [0,1,2],
        None,
        [8,8,8],
        [0,256,0,256,0,256]
    )

    cv2.normalize(hist, hist)

    return hist.flatten()
