import os
import random
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime, UTC

load_dotenv()
PORT = int(os.getenv("PORT", 8000))

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "ml",
        "time": datetime.now(UTC).isoformat()
    })

@app.post("/score")
def score_resume():
    data = request.get_json()
    resume_text = data.get("text", "")

    # TODO: Replace with real NLP scoring
    score = round(random.uniform(50, 100), 2)

    return jsonify({
        "score": score,
        "summary": "Mock analysis complete. Replace with AI model later."
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
