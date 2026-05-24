import React, { useState } from "react";
import { customerAPI } from "../api/client";

export default function CustomerRegisterPage({ onSuccess, onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      setError("Name, email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await customerAPI.register({ name, email, phone, password });
      localStorage.setItem("bol_customer_token", data.access_token);
      onSuccess?.(data.customer);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    padding: "11px 14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--muted)",
    display: "block",
    marginBottom: "5px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          animation: "fadeUp 0.4s ease both",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "32px",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "-1px",
            }}
          >
            BOL
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
              marginTop: "4px",
            }}
          >
            CUSTOMER PORTAL
          </div>
        </div>

        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Create your account
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label style={labelStyle}>Your name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arin Shah"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="Min 8 characters"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--danger)",
                marginTop: "10px",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              background: "var(--accent)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "12px",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--muted)",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            Already have an account?{" "}
            <span
              onClick={onGoLogin}
              style={{ color: "var(--accent)", cursor: "pointer" }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
