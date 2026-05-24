import React from "react";
import { Zap, FileText, MessageCircle, Mic } from "lucide-react";

const features = [
  { icon: Zap, label: "Type naturally", desc: "Hinglish supported" },
  { icon: FileText, label: "PDF in one click", desc: "GST-ready format" },
  { icon: MessageCircle, label: "WhatsApp share", desc: "Direct to customer" },
  { icon: Mic, label: "Voice billing", desc: "Speak your items" },
];

export default function Hero() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 0 32px",
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-head)",
          fontSize: "clamp(36px, 7vw, 64px)",
          fontWeight: 800,
          letterSpacing: "-2px",
          lineHeight: 1.05,
          marginBottom: "16px",
          color: "var(--text)",
        }}
      >
        Invoice in seconds.
        <br />
        <span style={{ color: "var(--accent)" }}>Just type it.</span>
      </h1>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          color: "var(--muted)",
          maxWidth: "400px",
          margin: "0 auto 32px",
          lineHeight: 1.6,
        }}
      >
        Type or speak items in Hindi or English. BOL converts it into a
        professional invoice instantly.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {features.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textAlign: "left",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--border2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <Icon size={15} color="var(--accent)" />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "var(--text)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
