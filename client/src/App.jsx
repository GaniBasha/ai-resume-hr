import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("checking...");
  const [mlStatus, setMlStatus] = useState("checking...");

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${API}/api/health`).then(r => r.json()).then(d => setApiStatus(d.status || "ok")).catch(() => setApiStatus("down"));

    // Direct call to ML (local dev); later the API will proxy/call it server-side
    fetch("http://localhost:8000/health").then(r => r.json()).then(d => setMlStatus(d.status || "ok")).catch(() => setMlStatus("down"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>AI-Powered Resume Screener</h1>
      <p>Frontend up ✅</p>
      <ul>
        <li>API health: {apiStatus}</li>
        <li>ML health: {mlStatus}</li>
      </ul>
    </div>
  );
}

export default App;
