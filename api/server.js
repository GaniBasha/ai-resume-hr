require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const app = express();

// ✅ Allow CORS for GitHub Pages & ML service
app.use(cors({
  origin: [
    "https://ganibasha.github.io", // Your GitHub Pages frontend
    process.env.ML_SERVICE_URL     // Your ML service URL
  ]
}));

app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', time: new Date().toISOString() });
});

// Resume Schema
const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  filePath: String,
  aiScore: Number,
  uploadedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', resumeSchema);

// Multer Storage (keep original extension)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Upload Resume + AI Scoring
app.post('/api/resumes', upload.single('resume'), async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log(`📄 Uploaded file: ${req.file.path}`);

    let aiScore = null;

    try {
      const formData = new FormData();
      formData.append("resume", fs.createReadStream(req.file.path));

      console.log(`📤 Sending file to ML service: ${req.file.path}`);

      const mlRes = await axios.post(
        `${process.env.ML_SERVICE_URL}/score`,
        formData,
        { headers: formData.getHeaders() }
      );

      aiScore = mlRes.data.score;
      console.log(`✅ AI score received: ${aiScore}`);
    } catch (mlErr) {
      console.error("⚠️ ML service error:", mlErr.message);
    }

    // Save to MongoDB
    const resume = new Resume({
      name,
      email,
      filePath: req.file.path,
      aiScore
    });
    await resume.save();

    res.json({ success: true, resume });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all resumes
app.get('/api/resumes', async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
