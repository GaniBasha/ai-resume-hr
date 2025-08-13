import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [apiStatus, setApiStatus] = useState("checking...");
  const [mlStatus, setMlStatus] = useState("checking...");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [resumes, setResumes] = useState([]);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Check health statuses
  useEffect(() => {
    fetch(`${API}/api/health`)
      .then((r) => r.json())
      .then((d) => setApiStatus(d.status || "ok"))
      .catch(() => setApiStatus("down"));

    fetch("http://localhost:8000/health")
      .then((r) => r.json())
      .then((d) => setMlStatus(d.status || "ok"))
      .catch(() => setMlStatus("down"));

    loadResumes();
  }, []);

  // Load uploaded resumes
  const loadResumes = () => {
    axios.get(`${API}/api/resumes`)
      .then((res) => setResumes(res.data))
      .catch((err) => console.error(err));
  };

  // Handle form submit
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      alert("Please select a file");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("resume", resumeFile);

      const res = await axios.post(`${API}/api/resumes`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setUploadMessage("✅ Resume uploaded successfully!");
        setName("");
        setEmail("");
        setResumeFile(null);
        loadResumes();
      } else {
        setUploadMessage("❌ Upload failed");
      }
    } catch (error) {
      console.error(error);
      setUploadMessage("❌ Error uploading resume");
    }
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1>AI-Powered Resume Screener</h1>
      <p>Frontend up ✅</p>
      <ul>
        <li>API health: {apiStatus}</li>
        <li>ML health: {mlStatus}</li>
      </ul>

      <h2>Upload Resume</h2>
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload Resume</button>
      </form>

      {uploadMessage && <p>{uploadMessage}</p>}

      <h2>Uploaded Resumes</h2>
      {resumes.length === 0 ? (
        <p>No resumes uploaded yet.</p>
      ) : (
        <ul>
          {resumes.map((r) => (
            <li key={r._id}>
              <strong>{r.name}</strong> ({r.email}) — uploaded {new Date(r.uploadedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
