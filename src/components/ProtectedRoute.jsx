import React from "react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { vendor, loading } = useAuth();

  // Still checking token — show nothing
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--muted)",
        }}
      >
        Loading...
      </div>
    );
  }

  // Not logged in — show login prompt inline
  if (!vendor) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            color: "var(--muted)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--accent)",
              marginBottom: "8px",
            }}
          >
            BOL
          </div>
          <p style={{ marginBottom: "20px", fontSize: "13px" }}>
            Please log in to continue
          </p>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              onClick={() => (window.location.hash = "#login")}
              style={{
                background: "var(--accent)",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "10px 24px",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              onClick={() => (window.location.hash = "#register")}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "10px 24px",
                fontFamily: "var(--font-head)",
                fontWeight: 600,
                fontSize: "13px",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
