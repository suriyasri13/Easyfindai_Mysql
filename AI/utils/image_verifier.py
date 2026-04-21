import cv2
import numpy as np

def verify_image_authenticity(image_path):
    """
    Analyzes an image to detect if it's likely a real-world photo 
    or a digital/stock image.
    """
    image = cv2.imread(image_path)
    if image is None:
        return {"is_authentic": False, "reason": "Invalid image file"}

    # 1. Check for "Natural" noise levels
    # Stock photos are often extremely clean/filtered. 
    # Real photos have sensor noise.
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # 2. Check for "Metadata" (Optional, but often removed in web images)
    # We can check for standard EXIF patterns if we used a library like 'exif',
    # but for now we'll focus on visual patterns.

    # 3. Check for typical "Stock" aspect ratios and resolutions
    height, width = image.shape[:2]
    is_square = 0.95 <= (width / height) <= 1.05
    
    # 4. Color Distribution Analysis
    # Real world photos have complex color distributions. 
    # Stock photos often have flat, optimized palettes.
    colors = cv2.calcHist([image], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
    non_zero_colors = np.count_nonzero(colors)

    # Heuristic scoring
    score = 100
    reasons = []

    if laplacian_var < 50:
        score -= 40
        reasons.append("Image appears artificially smooth or blurred (typical of web graphics)")
    
    if non_zero_colors < 100:
        score -= 30
        reasons.append("Limited color palette detected (typical of digital illustrations)")

    if width > 4000 or height > 4000:
        score -= 10
        reasons.append("Extremely high resolution may indicate professional stock photography")

    # Final verdict
    is_authentic = score > 50
    
    return {
        "is_authentic": is_authentic,
        "score": score,
        "reasons": reasons,
        "metadata": {
            "resolution": f"{width}x{height}",
            "sharpness": round(laplacian_var, 2),
            "color_complexity": int(non_zero_colors)
        }
    }
