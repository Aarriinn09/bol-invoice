import React from "react";
import { Store, User } from "lucide-react";

function Field({ icon: Icon, label, value, onChange, placeholder }) {
  return (
    <div>
      <label
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--muted)",
          display: "block",
          marginBottom: "5px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          size={14}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
          }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            padding: "10px 14px 10px 36px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
    </div>
  );
}

export default function InvoiceSettings({ settings, onChange }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
        animation: "fadeUp 0.4s 0.06s ease both",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-head)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "14px",
        }}
      >
        Invoice settings
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Field
          icon={Store}
          label="Shop name"
          value={settings.shopName}
          onChange={(v) => onChange({ ...settings, shopName: v })}
          placeholder="My Kirana Store"
        />
        <Field
          icon={User}
          label="Buyer name"
          value={settings.buyerName}
          onChange={(v) => onChange({ ...settings, buyerName: v })}
          placeholder="Customer name (optional)"
        />

        {/* GST selector */}
        <div>
          <label
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              display: "block",
              marginBottom: "7px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            GST rate
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[0, 5, 12, 18, 28].map((rate) => (
              <button
                key={rate}
                onClick={() => onChange({ ...settings, gstRate: rate })}
                style={{
                  padding: "6px 14px",
                  border: `1px solid ${settings.gstRate === rate ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  background:
                    settings.gstRate === rate ? "rgba(232,255,71,0.1)" : "none",
                  color:
                    settings.gstRate === rate
                      ? "var(--accent)"
                      : "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: settings.gstRate === rate ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {rate === 0 ? "None" : `${rate}%`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
