import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    const urls = ["http://localhost:5000/api", "http://localhost:5050/api", "/api"];
    const fetchApi = async () => {
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setMessage(data.message);
            return;
          }
        } catch (e) {}
      }
      setMessage("Backend connection failed");
    };
    fetchApi();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ fontSize: "48px", marginBottom: "8px" }}>🥞</div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>
        Full Stack Docker Application
      </h1>
      <p style={{ fontSize: "16px", color: "#64748b", margin: "0 0 24px 0" }}>
        Frontend: React
      </p>
      <div
        style={{
          display: "inline-block",
          backgroundColor: "#d1fae5",
          color: "#065f46",
          padding: "14px 28px",
          borderRadius: "9999px",
          fontWeight: "600",
          fontSize: "16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          border: "1px solid #a7f3d0",
        }}
      >
        Backend Response: {message}
      </div>
      <div style={{ marginTop: "40px", fontSize: "14px", color: "#94a3b8" }}>
        TeamUp Platform &bull; Exp 7: Full-Stack Docker &amp; Docker Compose Deployment
      </div>
    </div>
  );
}

export default App;
