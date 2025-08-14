import { useState, useEffect } from "react";
import axios from "axios";
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
  const [apiStatus, setApiStatus] = useState("checking...");
  const [mlStatus, setMlStatus] = useState("checking...");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newestId, setNewestId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const ML_URL = import.meta.env.VITE_ML_URL || "http://localhost:8000";

  // Check API health
  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setApiStatus(d.status || "ok"))
      .catch(() => setApiStatus("down"));

    fetch(`${ML_URL}/health`)
      .then((r) => r.json())
      .then((d) => setMlStatus(d.status || "ok"))
      .catch(() => setMlStatus("down"));

    loadResumes();
  }, []);

  // Load resumes
  const loadResumes = () => {
    axios
      .get(`${API_URL}/api/resumes`)
      .then((res) => setResumes(res.data))
      .catch((err) => console.error("Error loading resumes:", err));
  };

  // Polling for newest resume AI score
  useEffect(() => {
    if (!newestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/resumes`);
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

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile || !name || !email) {
      alert("Please fill all fields and select a resume.");
      return;
    }

    setUploadMessage("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("resume", resumeFile);

    try {
      const res = await axios.post(`${API_URL}/api/resumes`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setUploadMessage("✅ Resume uploaded successfully!");
        const newResume = res.data.resume;
        newResume.aiScore = null;
        setResumes((prev) => [newResume, ...prev]);
        setNewestId(newResume._id);

        setName("");
        setEmail("");
        setResumeFile(null);
        e.target.reset();
      } else {
        setUploadMessage("❌ Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("❌ Error uploading resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="glass-card">
        <h1 className="text-center mb-4">AI-Powered Resume Screener</h1>

        {/* API Health */}
        <ul className="list-unstyled mb-4">
          <li>API health: <strong>{apiStatus}</strong></li>
          <li>ML health: <strong>{mlStatus}</strong></li>
        </ul>

        {/* Upload Form */}
        <h2 className="mt-4">Upload Resume</h2>
        <form onSubmit={handleUpload} className="mb-4">
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
            required
          />
          <button
            type="submit"
            className="btn btn-custom w-100"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>

        {uploadMessage && <p>{uploadMessage}</p>}

        {/* Resumes Table */}
        <h2>Uploaded Resumes</h2>
        {resumes.length === 0 ? (
          <p>No resumes uploaded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Uploaded</th>
                  <th>AI Score</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr
                    key={r._id}
                    style={{
                      backgroundColor:
                        r._id === newestId
                          ? "rgba(0,255,0,0.1)"
                          : "transparent",
                    }}
                  >
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{new Date(r.uploadedAt).toLocaleString()}</td>
                    <td>
                      {r.aiScore !== null && r.aiScore !== undefined ? (
                        <ProgressBar
                          now={r.aiScore}
                          label={`${r.aiScore.toFixed(1)} / 100`}
                          variant={
                            r.aiScore > 75
                              ? "success"
                              : r.aiScore > 50
                              ? "warning"
                              : "danger"
                          }
                          animated
                        />
                      ) : r._id === newestId ? (
                        "Analyzing..."
                      ) : (
                        "Pending"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
