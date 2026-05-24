import { useState, useRef, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useVoiceRecorder({ onTranscript, onError }) {
  const [state, setState] = useState("idle"); // idle | recording | processing | error
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setState("processing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendToBackend(blob);
      };

      mediaRecorder.start(100); // collect chunks every 100ms
      setState("recording");
      setDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);
      setState("error");
      onError?.("Microphone access denied. Please allow mic permission.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    // Stop mic stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  async function sendToBackend(blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch(`${BACKEND_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Transcription failed");
      }

      const data = await res.json();
      console.log("Transcription result:", data);

      if (data.text) {
        onTranscript?.(data.text);
        setState("idle");
      } else {
        setState("error");
        onError?.("No speech detected. Please try again.");
      }
    } catch (err) {
      console.error("Backend error:", err);
      setState("error");
      onError?.(err.message || "Could not connect to voice server.");
    } finally {
      setDuration(0);
    }
  }

  return { state, duration, startRecording, stopRecording };
}
