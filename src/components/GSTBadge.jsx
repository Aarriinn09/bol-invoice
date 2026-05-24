import React from "react";

const GST_COLORS = {
  0: { bg: "rgba(74,222,128,0.1)", color: "#4ade80", label: "0%" },
  5: { bg: "rgba(56,189,248,0.1)", color: "#38bdf8", label: "5%" },
  12: { bg: "rgba(167,139,250,0.1)", color: "#a78bfa", label: "12%" },
  18: { bg: "rgba(232,255,71,0.1)", color: "#e8ff47", label: "18%" },
  28: { bg: "rgba(248,113,113,0.1)", color: "#f87171", label: "28%" },
};

export default function GSTBadge({ rate, hsn, matched }) {
  const config = GST_COLORS[rate] || GST_COLORS[18];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        marginTop: "3px",
      }}
    >
      <span
        style={{
          background: config.bg,
          color: config.color,
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: "4px",
          border: `1px solid ${config.color}30`,
        }}
      >
        GST {config.label}
      </span>
      {hsn && hsn !== "9999" && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--muted)",
          }}
        >
          HSN {hsn}
        </span>
      )}
      {!matched && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          (default)
        </span>
      )}
    </div>
  );
}
