import React, { useState } from "react";
import { authAPI, customerAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Phone, Lock, Store, User } from "lucide-react";

export default function LoginPage({ onSuccess, onGoRegister }) {
  const { login } = useAuth();
  const [role, setRole] = useState("vendor");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone || !password) {
      setError("Fill in all fields");
      return;
    }
    if (phone.length < 10) {
      setError("Enter valid phone number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (role === "vendor") {
        const data = await authAPI.login({ phone, password });
        login(data.access_token, data.vendor);
        onSuccess?.();
      } else {
        const data = await customerAPI.login({ phone, password });
        localStorage.setItem("bol_customer_token", data.access_token);
        window.location.hash = "#customer";
      }
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
    fontSize: "15px",
    padding: "12px 14px 12px 42px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const iconStyle = {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    pointerEvents: "none",
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
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "36px",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "-2px",
            }}
          >
            BOL
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.12em",
              marginTop: "4px",
            }}
          >
            VOICE-POWERED INVOICE
          </div>
        </div>

        {/* Role toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--bg3)",
            borderRadius: "var(--radius-lg)",
            padding: "4px",
            marginBottom: "20px",
            border: "1px solid var(--border)",
          }}
        >
          {[
            { key: "vendor", label: "Vendor", icon: Store },
            { key: "customer", label: "Customer", icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setRole(key);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                background: role === key ? "var(--accent)" : "none",
                color: role === key ? "#0a0a0a" : "var(--muted)",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-head)",
                fontWeight: role === key ? 700 : 400,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "20px",
              color: "var(--text)",
            }}
          >
            {role === "vendor" ? "Vendor login" : "Customer login"}
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Phone */}
            <div>
              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: "6px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Phone number
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={15} style={iconStyle} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="9876543210"
                  maxLength={10}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: "6px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={iconStyle} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--danger)",
                marginTop: "12px",
                padding: "8px 12px",
                background: "rgba(248,113,113,0.08)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              background: loading ? "var(--bg3)" : "var(--accent)",
              color: loading ? "var(--muted)" : "#0a0a0a",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "13px",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--accent2)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--accent)";
            }}
          >
            {loading ? "Logging in..." : "Login"}
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
            No account?{" "}
            <span
              onClick={onGoRegister}
              style={{ color: "var(--accent)", cursor: "pointer" }}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
