import React, { useState } from "react";
import { X, Check, Store } from "lucide-react";
import { authAPI } from "../api/client";

export default function VendorProfile({ vendor, onClose, onUpdate }) {
  const [gstin, setGstin] = useState(vendor?.gstin || "");
  const [phone, setPhone] = useState(vendor?.phone || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await authAPI.updateProfile({ gstin, phone });
      onUpdate?.(updated);
      setMsg("Saved!");
      setTimeout(() => {
        setMsg("");
        onClose();
      }, 1200);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
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
    padding: "10px 14px",
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
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
        }}
      />

      {/* Modal — fixed to top area, never off screen */}
      <div
        style={{
          position: "fixed",
          top: "70px", // ← just below header
          right: "24px", // ← aligned to right side
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          width: "360px",
          maxWidth: "calc(100vw - 48px)",
          zIndex: 201,
          animation: "fadeUp 0.2s ease both",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Store size={15} color="var(--accent)" />
            <span
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Shop Profile
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} color="var(--muted)" />
          </button>
        </div>

        {/* Shop info — read only */}
        <div
          style={{
            background: "var(--bg3)",
            borderRadius: "var(--radius)",
            padding: "10px 12px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 600,
              fontSize: "14px",
              marginBottom: "2px",
            }}
          >
            {vendor?.shop_name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
            }}
          >
            {vendor?.email}
          </div>
        </div>

        {/* Editable fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={labelStyle}>GSTIN (optional)</label>
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--muted)",
                marginTop: "4px",
                lineHeight: 1.4,
              }}
            >
              Enables GST badges on invoices and GST filing dashboard
            </p>
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
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
        </div>

        {/* Feedback */}
        {msg && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: msg === "Saved!" ? "var(--success)" : "var(--danger)",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            {msg}
          </p>
        )}

        {/* Save button — always visible */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            marginTop: "16px",
            background: saving ? "var(--bg3)" : "var(--accent)",
            color: saving ? "var(--muted)" : "#0a0a0a",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "11px",
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            transition: "all 0.2s",
          }}
        >
          <Check size={14} />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </>
  );
}
