import React, { useState } from "react";
import { Send, Check, Copy, Link, Phone } from "lucide-react";
import { invoicesAPI } from "../api/client";

export default function SendInvoicePanel({
  invoiceId,
  invoiceNumber,
  invoiceData,
}) {
  const [mode, setMode] = useState("registered");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!invoiceId) return null;

  const publicLink = invoicesAPI.generatePublicLink(invoiceNumber);

  async function handleSend() {
    if (!phone.trim() || phone.length < 10) {
      setError("Enter valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await invoicesAPI.sendToCustomer(invoiceId, phone.trim());
      setResult(res);

      if (!res.found) {
        // Customer not on BOL — open WhatsApp automatically
        openWhatsApp(phone.trim(), res.public_link);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openWhatsApp(customerPhone, link) {
    // Build invoice summary text
    const items = invoiceData?.items || [];
    const total = invoiceData?.total || 0;
    const shopName = invoiceData?.shopName || "BOL Invoice";

    const msg = [
      `*${shopName}*`,
      `Invoice: ${invoiceNumber}`,
      ``,
      ...items.map((i) => `• ${i.name} x${i.qty} = Rs.${i.total.toFixed(2)}`),
      ``,
      `*Total: Rs.${parseFloat(total).toFixed(2)}*`,
      ``,
      `View invoice: ${link}`,
      ``,
      `_Sent via BOL Invoice_`,
    ].join("\n");

    // wa.me deep link — opens WhatsApp with number + message pre-filled
    const waUrl = `https://wa.me/91${customerPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const inputStyle = {
    flex: 1,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    padding: "10px 14px 10px 40px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        animation: "fadeUp 0.3s ease both",
      }}
    >
      {/* Mode toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "registered", label: "Send to BOL user", icon: Send },
          { key: "link", label: "Public link", icon: Link },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setMode(key);
              setResult(null);
              setError("");
            }}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: mode === key ? "var(--bg3)" : "none",
              border: "none",
              borderBottom:
                mode === key
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              color: mode === key ? "var(--text)" : "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 18px" }}>
        {/* Mode 1 — Send to registered BOL user by phone */}
        {mode === "registered" && (
          <>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                marginBottom: "10px",
                lineHeight: 1.5,
              }}
            >
              Enter customer's phone number. If they're on BOL, invoice goes to
              their app. If not, WhatsApp opens automatically.
            </p>

            <div style={{ display: "flex", gap: "8px", position: "relative" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Phone
                  size={14}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="9876543210"
                  maxLength={10}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                style={{
                  background: loading ? "var(--bg3)" : "var(--accent)",
                  color: loading ? "var(--muted)" : "#0a0a0a",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "10px 16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "13px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s",
                }}
              >
                <Send size={13} />
                {loading ? "Sending..." : "Send"}
              </button>
            </div>

            {error && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--danger)",
                  marginTop: "8px",
                }}
              >
                {error}
              </p>
            )}

            {/* Success — customer found on BOL */}
            {result?.found && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "10px",
                  padding: "10px 12px",
                  background: "rgba(74,222,128,0.08)",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(74,222,128,0.2)",
                }}
              >
                <Check size={14} color="var(--success)" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--success)",
                  }}
                >
                  {result.message}
                </span>
              </div>
            )}

            {/* Not found — WhatsApp opened automatically */}
            {result && !result.found && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  background: "rgba(37,211,102,0.08)",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(37,211,102,0.2)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "#25D366",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={13} />
                  WhatsApp opened with invoice
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                  }}
                >
                  Customer not on BOL — sent via WhatsApp instead
                </p>
              </div>
            )}
          </>
        )}

        {/* Mode 2 — Public link */}
        {mode === "link" && (
          <>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                marginBottom: "12px",
              }}
            >
              Share this link with anyone — no BOL account needed
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "10px 14px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--accent)",
                  flex: 1,
                  wordBreak: "break-all",
                  lineHeight: 1.4,
                }}
              >
                {publicLink}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              style={{
                width: "100%",
                background: copied ? "rgba(74,222,128,0.1)" : "var(--bg3)",
                border: `1px solid ${
                  copied ? "rgba(74,222,128,0.3)" : "var(--border)"
                }`,
                borderRadius: "var(--radius)",
                padding: "10px",
                color: copied ? "var(--success)" : "var(--text)",
                fontFamily: "var(--font-head)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                transition: "all 0.15s",
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
