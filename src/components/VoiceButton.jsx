import React, { useState } from "react";
import { Mic, MicOff, Loader } from "lucide-react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

export default function VoiceButton({ onTranscript }) {
  const [error, setError] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");

  const { state, duration, startRecording, stopRecording } = useVoiceRecorder({
    onTranscript: (text) => {
      setError("");
      setLastTranscript(text); // ← store what was heard
      onTranscript(text);
    },
    onError: (msg) => {
      setError(msg);
      setLastTranscript("");
    },
  });

  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isIdle = state === "idle" || state === "error";

  function handleMouseDown() {
    if (isIdle) {
      setError("");
      startRecording();
    }
  }
  function handleMouseUp() {
    if (isRecording) stopRecording();
  }
  function handleTouchStart(e) {
    e.preventDefault();
    if (isIdle) {
      setError("");
      startRecording();
    }
  }
  function handleTouchEnd(e) {
    e.preventDefault();
    if (isRecording) stopRecording();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        width: "100%",
      }}
    >
      {/* Mic button */}
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isRecording) stopRecording();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={isProcessing}
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: isRecording
            ? "2px solid var(--accent)"
            : "2px solid var(--border2)",
          background: isRecording
            ? "rgba(232,255,71,0.1)"
            : isProcessing
              ? "var(--bg3)"
              : "var(--bg2)",
          cursor: isProcessing ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          animation: isRecording ? "pulse-ring 1.2s infinite" : "none",
          flexShrink: 0,
        }}
      >
        {isProcessing ? (
          <Loader
            size={22}
            color="var(--muted)"
            style={{ animation: "spin 1s linear infinite" }}
          />
        ) : isRecording ? (
          <MicOff size={22} color="var(--accent)" />
        ) : (
          <Mic size={22} color="var(--muted)" />
        )}
      </button>

      {/* Status */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          textAlign: "center",
          color: isRecording ? "var(--accent)" : "var(--muted)",
          minHeight: "14px",
        }}
      >
        {isRecording && `${duration}s — release to stop`}
        {isProcessing && "Transcribing..."}
        {isIdle && !isRecording && !isProcessing && "Hold to speak"}
      </div>

      {/* ── What Whisper heard — always visible after transcription ── */}
      {lastTranscript && !isRecording && !isProcessing && (
        <div
          style={{
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "6px 10px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--muted)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: "3px",
            }}
          >
            Heard
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--accent)",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            "{lastTranscript}"
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--danger)",
            textAlign: "center",
            lineHeight: 1.5,
            width: "100%",
          }}
        >
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
