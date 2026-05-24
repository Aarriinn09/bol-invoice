import React from "react";

// ── SVG illustrations ─────────────────────────────────────────────────────────
function InvoiceIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect
        x="20"
        y="10"
        width="80"
        height="100"
        rx="8"
        fill="var(--bg3)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <rect x="30" y="25" width="60" height="6" rx="3" fill="var(--border2)" />
      <rect x="30" y="38" width="45" height="4" rx="2" fill="var(--border)" />
      <rect x="30" y="50" width="50" height="4" rx="2" fill="var(--border)" />
      <rect x="30" y="62" width="40" height="4" rx="2" fill="var(--border)" />
      <rect x="20" y="80" width="80" height="1" fill="var(--border)" />
      <rect
        x="60"
        y="88"
        width="35"
        height="6"
        rx="3"
        fill="var(--accent)"
        opacity="0.3"
      />
      <circle
        cx="90"
        cy="95"
        r="18"
        fill="var(--accent)"
        opacity="0.1"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
      <path
        d="M83 95 L87 99 L97 89"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

function AnalyticsIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect
        x="10"
        y="80"
        width="20"
        height="30"
        rx="3"
        fill="var(--accent)"
        opacity="0.2"
      />
      <rect
        x="35"
        y="60"
        width="20"
        height="50"
        rx="3"
        fill="var(--accent)"
        opacity="0.35"
      />
      <rect
        x="60"
        y="40"
        width="20"
        height="70"
        rx="3"
        fill="var(--accent)"
        opacity="0.5"
      />
      <rect
        x="85"
        y="20"
        width="20"
        height="90"
        rx="3"
        fill="var(--accent)"
        opacity="0.8"
      />
      <path
        d="M15 75 L45 55 L70 35 L95 15"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 2"
      />
    </svg>
  );
}

function ShoppingIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <path
        d="M25 30 L35 30 L45 75 L90 75 L100 45 L40 45"
        stroke="var(--border2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="52" cy="88" r="6" fill="var(--border2)" />
      <circle cx="80" cy="88" r="6" fill="var(--border2)" />
      <rect
        x="50"
        y="20"
        width="40"
        height="30"
        rx="6"
        fill="var(--bg3)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <path
        d="M60 35 L65 40 L75 28"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CreditIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect
        x="15"
        y="35"
        width="90"
        height="60"
        rx="8"
        fill="var(--bg3)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <rect
        x="15"
        y="50"
        width="90"
        height="12"
        fill="var(--border)"
        opacity="0.5"
      />
      <rect x="25" y="72" width="30" height="6" rx="3" fill="var(--border2)" />
      <rect
        x="75"
        y="72"
        width="20"
        height="6"
        rx="3"
        fill="var(--accent)"
        opacity="0.4"
      />
      <circle
        cx="85"
        cy="30"
        r="12"
        fill="var(--success)"
        opacity="0.15"
        stroke="var(--success)"
        strokeWidth="1.5"
      />
      <path
        d="M80 30 L83 33 L90 26"
        stroke="var(--success)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ILLUSTRATIONS = {
  invoice: InvoiceIllustration,
  analytics: AnalyticsIllustration,
  shopping: ShoppingIllustration,
  credit: CreditIllustration,
};

// ── Main component ────────────────────────────────────────────────────────────
export default function EmptyState({
  illustration = "invoice",
  title,
  description,
  action,
  actionLabel,
}) {
  const Illustration = ILLUSTRATIONS[illustration] || InvoiceIllustration;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px",
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        animation: "fadeUp 0.4s ease both",
      }}
    >
      <div style={{ marginBottom: "20px", opacity: 0.7 }}>
        <Illustration />
      </div>

      <h3
        style={{
          fontFamily: "var(--font-head)",
          fontWeight: 700,
          fontSize: "18px",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--muted)",
            maxWidth: "280px",
            lineHeight: 1.6,
            marginBottom: action ? "20px" : 0,
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action}
          style={{
            background: "var(--accent)",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "10px 24px",
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
        >
          {actionLabel || "Get started"}
        </button>
      )}
    </div>
  );
}
