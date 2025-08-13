require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', time: new Date().toISOString() });
});

// Resume schema
const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  filePath: String,
  aiScore: Number, // AI score from ML service
  uploadedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', resumeSchema);

// File upload setup
const upload = multer({ dest: 'uploads/' });

// POST /api/resumes — upload resume file & send to ML service
app.post('/api/resumes', upload.single('resume'), async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Extract text from PDF
    const fileBuffer = fs.readFileSync(req.file.path);
    let resumeText = "";
    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(fileBuffer);
      resumeText = data.text;
    } else {
      resumeText = "Text extraction not implemented for this file type.";
    }

    // Send to ML service
    let aiScore = null;
    try {
      const mlRes = await axios.post(process.env.ML_SERVICE_URL + '/score', {
        text: resumeText
      });
      aiScore = mlRes.data.score;
    } catch (mlErr) {
      console.error("❌ ML service error:", mlErr.message);
    }

    // Save to DB
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

// GET /api/resumes — list all resumes
app.get('/api/resumes', async (req, res) => {
  const resumes = await Resume.find().sort({ uploadedAt: -1 });
  res.json(resumes);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
