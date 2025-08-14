import React, { useState, useEffect } from "react";
import axios from "axios";
import ProgressBar from "react-bootstrap/ProgressBar"; // Bootstrap ProgressBar

export default function ResumeUpload() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newestId, setNewestId] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  const fetchResumes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/resumes`);
      setResumes(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    if (!newestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/resumes`);
        setResumes(res.data);
        const updated = res.data.find((r) => r._id === newestId);
        if (updated && updated.aiScore !== null) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("❌ Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [newestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !resume) {
      setError("Please fill all fields and choose a file.");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("resume", resume);

    try {
      const res = await axios.post(`${API_BASE}/resumes`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const newResume = res.data.resume;
        newResume.aiScore = null;
        setResumes((prev) => [newResume, ...prev]);
        setNewestId(newResume._id);

        setName("");
        setEmail("");
        setResume(null);
        e.target.reset();
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center text-white mb-4">AI-Powered Resume Screener</h1>

      <div className="glass-card mb-4">
        <h4>Upload Resume</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setResume(e.target.files[0])}
            />
          </div>
          <button className="btn btn-custom w-100" type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>

      <div className="glass-card">
        <h4>Uploaded Resumes</h4>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>AI Score</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r) => (
              <tr
                key={r._id}
                style={{
                  backgroundColor: r._id === newestId ? "rgba(0,255,0,0.1)" : "transparent",
                }}
              >
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>
                  {r.aiScore !== null ? (
                    <ProgressBar
                      now={r.aiScore}
                      label={`${r.aiScore.toFixed(1)} / 100`}
                      variant={r.aiScore > 75 ? "success" : r.aiScore > 50 ? "warning" : "danger"}
                      animated
                    />
                  ) : r._id === newestId ? (
                    "Analyzing..."
                  ) : (
                    "Pending"
                  )}
                </td>
                <td>{new Date(r.uploadedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
