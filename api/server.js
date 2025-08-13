require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // For dev; we’ll tighten in prod
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', time: new Date().toISOString() });
});

// TODO: add routes:
// - POST /api/resumes (upload -> store -> send to ML -> persist score)
// - GET  /api/jobs (filter/search)
// - GET  /api/recommendations?userId=...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
