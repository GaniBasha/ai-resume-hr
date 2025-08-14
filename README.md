Got it — I’ll add your name, course, and college details in a professional way at the top of the README so it stands out but still looks clean.

Here’s the updated **README.md**:

---

```markdown
# AI Resume HR

**Author:** Sk. Gani Basha  
**Course:** CSE (AI & ML)  
**College:** Chebrolu Engineering College  

An AI-powered resume screening platform that allows HR professionals to upload candidate resumes (PDF/DOCX) and receive instant AI-based scoring with keyword analysis.

---

## 🚀 Live Demo
Frontend: [https://ganibasha.github.io/ai-resume-hr/](https://ganibasha.github.io/ai-resume-hr/)  
Backend API: `https://ai-resume-hr.onrender.com`  
ML Service: `https://ai-resume-hr-1.onrender.com`

---

## 📂 Project Structure
```

ai-resume-hr/
│
├── client/              # React frontend
│   ├── src/              # Components & pages
│   ├── public/
│   ├── package.json
│
├── server/              # Node.js + Express backend API
│   ├── uploads/         # Stored resumes
│   ├── models/          # MongoDB models
│   ├── server.js        # Main entry point
│
├── ml-service/          # Python Flask AI scoring service
│   ├── uploads/         # Temporary resume files
│   ├── app.py           # Flask app
│
└── README.md

````

---

## ⚡ Features
- Upload **PDF/DOCX** resumes
- AI-based scoring using keyword matching & word count
- Resume storage in MongoDB
- Fetch all uploaded resumes
- Responsive UI (React + GitHub Pages)
- Cross-Origin support for GitHub Pages + Render deployment

---

## 🛠️ Tech Stack
**Frontend:** React, GitHub Pages  
**Backend API:** Node.js, Express, MongoDB (Mongoose)  
**AI Service:** Python, Flask, PyMuPDF, python-docx  
**Deployment:** Render, GitHub Pages  
**Other Tools:** Multer, Axios, dotenv, Flask-CORS

---

## 🔌 API Endpoints

### **Backend API**
| Method | Endpoint           | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/health`     | API health check     |
| POST   | `/api/resumes`    | Upload resume + score|
| GET    | `/api/resumes`    | Get all resumes      |

### **ML Service**
| Method | Endpoint  | Description             |
|--------|-----------|-------------------------|
| GET    | `/health` | ML service health check |
| POST   | `/score`  | Upload resume to score  |

---

## ⚙️ Setup & Run Locally

### **1. Clone the repository**
```bash
git clone https://github.com/ganibasha/ai-resume-hr.git
cd ai-resume-hr
````

### **2. Frontend (React)**

```bash
cd client
npm install
npm start
```

### **3. Backend API (Node.js)**

```bash
cd server
npm install
# Create .env file:
# MONGO_URI=your_mongo_connection
# ML_SERVICE_URL=https://your-ml-service-url
node server.js
```

### **4. ML Service (Python)**

```bash
cd ml-service
pip install -r requirements.txt
# Create .env file:
# PORT=8000
python app.py
```

---

## 🚀 Deployment

* **Frontend:** GitHub Pages (`npm run deploy`)
* **Backend API:** Render (Node.js)
* **ML Service:** Render (Python Flask)

Ensure CORS allows:

```
https://ganibasha.github.io
https://your-api-url
```

---

## 📸 Screenshots

Added on the media folder.

---

## 📜 License

This project is licensed under the MIT License.


