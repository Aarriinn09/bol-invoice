import React, { useState, useEffect } from "react";
import { Check, X, Sparkles } from "lucide-react";

export default function MatchBadge({ item, onAccept, onReject }) {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state if a NEW item comes in
  // (same component instance reused for different items)
  useEffect(() => {
    setDismissed(false);
  }, [item.name, item.suggestedName]);

  // Conditions to hide badge
  if (dismissed) return null;
  if (!item.matchResult) return null;
  if (!item.matchResult.matched) return null;
  if (item.matchResult.matchType === "exact") return null;
  if (!item.suggestedName) return null;
  if (item.suggestedName === item.name) return null;

  const pct = Math.round(item.matchResult.score * 100);

  function handleAccept() {
    onAccept(item.suggestedName, item.suggestedPrice);
    setDismissed(true);
  }

  function handleReject() {
    onReject();
    setDismissed(true);
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        flexWrap: "wrap",
        background: "rgba(232,255,71,0.06)",
        border: "1px solid rgba(232,255,71,0.18)",
        borderRadius: "6px",
        padding: "3px 8px",
        marginTop: "5px",
      }}
    >
      <Sparkles size={9} color="var(--accent)" />

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--muted)",
        }}
      >
        did you mean
      </span>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--accent)",
          fontWeight: 500,
        }}
      >
        {item.suggestedName}
      </span>

      {item.suggestedPrice > 0 && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--muted)",
          }}
        >
          ₹{item.suggestedPrice}
        </span>
      )}

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--muted)",
          opacity: 0.6,
        }}
      >
        {pct}%
      </span>

      <button
        onClick={handleAccept}
        style={{
          background: "rgba(74,222,128,0.12)",
          border: "1px solid rgba(74,222,128,0.25)",
          borderRadius: "4px",
          padding: "2px 7px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "3px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--success)",
        }}
      >
        <Check size={9} /> yes
      </button>

      <button
        onClick={handleReject}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "2px 7px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "3px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--muted)",
        }}
      >
        <X size={9} /> no
      </button>
    </div>
  );
}
