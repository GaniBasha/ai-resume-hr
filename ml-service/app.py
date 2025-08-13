import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS  # <-- add this

load_dotenv()
PORT = int(os.getenv("PORT", 8000))

app = Flask(__name__)
CORS(app)  # <-- allow cross-origin requests

@app.get("/health")
def health():
    from datetime import datetime, UTC
    return jsonify({
        "status": "ok",
        "service": "ml",
        "time": datetime.now(UTC).isoformat()
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
