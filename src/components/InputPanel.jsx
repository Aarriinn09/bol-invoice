import React, { useState, useRef } from "react";
import { Zap, RotateCcw, ChevronRight } from "lucide-react";
import { EXAMPLES } from "../utils/parser";
import VoiceButton from "./VoiceButton";

export default function InputPanel({ onParse, onVoiceAdd, loading }) {
  const [text, setText] = useState("");
  const [exIdx, setExIdx] = useState(0);
  const ref = useRef(null);

  function handleSubmit() {
    if (text.trim()) {
      onParse(text);
      setText("");
    }
  }

  function loadExample() {
    setText(EXAMPLES[exIdx % EXAMPLES.length]);
    setExIdx((i) => i + 1);
    ref.current?.focus();
  }

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        animation: "fadeUp 0.4s ease both",
      }}
    >
      {/* ── Two column layout ── */}
      <div style={{ display: "flex", minHeight: "200px" }}>
        {/* LEFT — Voice */}
        <div
          style={{
            flex: "0 0 200px",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
            gap: "12px",
            background: "var(--bg)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Speak items
          </p>
          <VoiceButton onTranscript={onVoiceAdd} />
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--muted)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Hold · speak · release
          </p>
        </div>

        {/* RIGHT — Text input */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "16px",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Type items
            </span>
            <button
              onClick={loadExample}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--muted)",
                fontSize: "11px",
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
              }}
            >
              <ChevronRight size={11} /> example
            </button>
          </div>

          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
            }}
            rows={4}
            placeholder={"lays 10, pepsi 20\ndairy milk 30, kurkure 10"}
            style={{
              flex: 1,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              lineHeight: "1.7",
              padding: "10px 14px",
              resize: "none",
              outline: "none",
              caretColor: "var(--accent)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              style={{
                flex: 1,
                background: text.trim() ? "var(--accent)" : "var(--bg3)",
                color: text.trim() ? "#0a0a0a" : "var(--muted)",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "10px 16px",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: text.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              <Zap size={13} />
              {loading ? "Adding..." : "Add to Invoice"}
            </button>

            {text && (
              <button
                onClick={() => setText("")}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={13} color="var(--muted)" />
              </button>
            )}
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            Separate with commas · Ctrl+Enter to add
          </p>
        </div>
      </div>
    </div>
  );
}
