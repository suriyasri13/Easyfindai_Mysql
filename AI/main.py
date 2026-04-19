from api.app import app

if __name__ == "__main__":
    print("AI Matching Service starting on port 5000...")
    app.run(port=5000, host='0.0.0.0', debug=True)
