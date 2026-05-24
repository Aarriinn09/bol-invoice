import React, { useState } from "react";
import { Check, ChevronRight, Store, Receipt, Mic } from "lucide-react";
import { authAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to BOL",
    subtitle: "Voice-powered invoicing for your shop",
  },
  {
    id: "shop",
    title: "Your shop details",
    subtitle: "Help customers recognise your invoices",
  },
  {
    id: "gstin",
    title: "GST registration",
    subtitle: "Optional — only for registered GST vendors",
  },
  {
    id: "ready",
    title: "You're all set!",
    subtitle: "Start creating invoices in seconds",
  },
];

export default function OnboardingWizard({ onComplete }) {
  const { vendor, login } = useAuth();
  const [step, setStep] = useState(0);
  const [gstin, setGstin] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleGSTINSave() {
    if (!gstin) {
      nextStep();
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("bol_token");
      const updated = await authAPI.updateProfile({ gstin });
      login(token, updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      nextStep();
    }
  }

  function nextStep() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onComplete();
  }

  const current = STEPS[step];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          animation: "scaleIn 0.3s ease both",
        }}
      >
        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginBottom: "32px",
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? "24px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i <= step ? "var(--accent)" : "var(--border2)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "32px",
          }}
        >
          {/* Welcome step */}
          {step === 0 && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "rgba(232,255,71,0.1)",
                  border: "2px solid rgba(232,255,71,0.3)",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--accent)",
                  }}
                >
                  B
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "26px",
                  fontWeight: 800,
                  marginBottom: "10px",
                  letterSpacing: "-0.5px",
                }}
              >
                {current.title}
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  marginBottom: "28px",
                }}
              >
                {current.subtitle}
              </p>

              {/* Feature highlights */}
              {[
                { icon: Mic, text: "Speak items in Hindi or English" },
                { icon: Receipt, text: "Generate GST invoices instantly" },
                { icon: Store, text: "Send to customers via WhatsApp" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    marginBottom: "8px",
                    background: "var(--bg3)",
                    borderRadius: "var(--radius)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      flexShrink: 0,
                      background: "rgba(232,255,71,0.1)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={14} color="var(--accent)" />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Shop details step */}
          {step === 1 && (
            <div>
              <Store
                size={24}
                color="var(--accent)"
                style={{ marginBottom: "14px" }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                {current.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginBottom: "24px",
                }}
              >
                {current.subtitle}
              </p>

              <div
                style={{
                  background: "var(--bg3)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  {vendor?.shop_name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  {vendor?.email}
                </div>
                {vendor?.phone && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "2px",
                    }}
                  >
                    {vendor.phone}
                  </div>
                )}
              </div>

              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginTop: "12px",
                  lineHeight: 1.5,
                }}
              >
                This name and email appears on all your invoices. You can update
                it anytime from Settings.
              </p>
            </div>
          )}

          {/* GSTIN step */}
          {step === 2 && (
            <div>
              <Receipt
                size={24}
                color="var(--accent)"
                style={{ marginBottom: "14px" }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                {current.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginBottom: "20px",
                  lineHeight: 1.5,
                }}
              >
                If your annual turnover is above ₹40 lakhs, you need a GSTIN.
                Skip this if you're a small shop.
              </p>

              <input
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "15px",
                  letterSpacing: "0.05em",
                  padding: "12px 14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  marginBottom: "10px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  background: "rgba(232,255,71,0.05)",
                  border: "1px solid rgba(232,255,71,0.1)",
                  borderRadius: "var(--radius)",
                  padding: "10px 12px",
                }}
              >
                <Receipt
                  size={12}
                  color="var(--accent)"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Adding GSTIN enables HSN codes, CGST/SGST breakdown in PDFs,
                  and GSTR-1 export.
                </p>
              </div>
            </div>
          )}

          {/* Ready step */}
          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "rgba(74,222,128,0.1)",
                  border: "2px solid rgba(74,222,128,0.3)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Check size={28} color="var(--success)" />
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "24px",
                  fontWeight: 800,
                  marginBottom: "10px",
                }}
              >
                {current.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  marginBottom: "8px",
                }}
              >
                {current.subtitle}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                Type or speak your first invoice below. Try:{" "}
                <em style={{ color: "var(--accent)" }}>
                  "lays 10, pepsi 20, dairy milk 30"
                </em>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
            {step === 2 && (
              <button
                onClick={nextStep}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Skip for now
              </button>
            )}

            <button
              onClick={step === 2 ? handleGSTINSave : nextStep}
              disabled={saving}
              style={{
                flex: 1,
                padding: "12px",
                background: step === 3 ? "var(--accent)" : "var(--accent)",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "14px",
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                transition: "background 0.15s",
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              {saving ? (
                "Saving..."
              ) : step === 3 ? (
                <>
                  Start invoicing <ChevronRight size={15} />
                </>
              ) : (
                <>
                  Continue <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
