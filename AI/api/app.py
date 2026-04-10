from flask import Flask, request, jsonify
import sys
import os

# Add parent directory to path so that utils can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.feature_extractor import extract_features
from utils.matcher import match_items, text_similarity

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/matchAI", methods=["POST"])
def match_ai():

    lost_image = request.files.get("lost_image")
    found_image = request.files.get("found_image")

    lost_description = request.form.get("lost_description")
    found_description = request.form.get("found_description")

    if not lost_image or not found_image:
        return jsonify({"error": "Both images are required"}), 400

    lost_path = os.path.join(UPLOAD_FOLDER, lost_image.filename)
    found_path = os.path.join(UPLOAD_FOLDER, found_image.filename)

    lost_image.save(lost_path)
    found_image.save(found_path)

    # Image similarity
    lost_features = extract_features(lost_path)
    found_features = extract_features(found_path)
    image_score = match_items(lost_features, found_features)

    # Text similarity
    text_score = text_similarity(lost_description, found_description)

    # Hybrid scoring
    final_score = round((0.7 * image_score + 0.3 * text_score), 2)

    if final_score > 0.8:
        status = "High Confidence Match"
    elif final_score > 0.5:
        status = "Medium Confidence"
    else:
        status = "Low Confidence"

    return jsonify({
        "image_score": image_score,
        "text_score": text_score,
        "final_score": final_score,
        "status": status
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
