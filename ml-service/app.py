import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime, UTC
import fitz  # PyMuPDF for PDF text extraction
import docx  # python-docx for DOCX extraction

load_dotenv()
PORT = int(os.getenv("PORT", 8000))

app = Flask(__name__)
CORS(app)

# Health check
@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "ml",
        "time": datetime.now(UTC).isoformat()
    })

# Extract text from PDF
def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

# Extract text from DOCX
def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

# Simple scoring logic
def calculate_score(text):
    word_count = len(text.split())
    keywords = ["Python", "Machine Learning", "AI", "Data", "JavaScript", "React"]
    keyword_hits = sum(1 for kw in keywords if kw.lower() in text.lower())
    score = min(100, (word_count / 10) + (keyword_hits * 10))
    return round(score, 2)

# Receive file & return AI score
@app.post("/score")
def score_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)

    # Extract text based on type
    if file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file.filename.lower().endswith(".docx"):
        text = extract_text_from_docx(file_path)
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    score = calculate_score(text)

    return jsonify({
        "score": score,
        "analysis": {
            "word_count": len(text.split()),
            "keywords_found": score // 10
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
