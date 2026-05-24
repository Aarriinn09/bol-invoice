import React, { useState, useEffect } from "react";
import { Check, X, ChevronDown } from "lucide-react";

// Built-in variants for common products
const BUILT_IN_VARIANTS = {
  lays: [
    { label: "Classic Salt 26g", price: 10 },
    { label: "Magic Masala 26g", price: 10 },
    { label: "Magic Masala 52g", price: 20 },
    { label: "Cream & Onion 26g", price: 10 },
    { label: "Cream & Onion 52g", price: 20 },
    { label: "Spanish Tomato 52g", price: 20 },
  ],
  pepsi: [
    { label: "250ml", price: 20 },
    { label: "500ml", price: 40 },
    { label: "1.25L", price: 60 },
    { label: "2L", price: 90 },
  ],
  "coca cola": [
    { label: "250ml", price: 20 },
    { label: "500ml", price: 40 },
    { label: "1.25L", price: 60 },
  ],
  sprite: [
    { label: "250ml", price: 20 },
    { label: "500ml", price: 40 },
    { label: "1.25L", price: 60 },
  ],
  "dairy milk": [
    { label: "13g  ₹20", price: 20 },
    { label: "36g  ₹50", price: 50 },
    { label: "Silk 60g", price: 99 },
    { label: "Fruit & Nut", price: 99 },
  ],
  bisleri: [
    { label: "500ml", price: 10 },
    { label: "1L", price: 20 },
    { label: "2L", price: 35 },
  ],
  maggi: [
    { label: "70g single", price: 14 },
    { label: "140g double", price: 28 },
    { label: "560g family", price: 99 },
  ],
  kurkure: [
    { label: "Masala Munch 22g", price: 10 },
    { label: "Masala Munch 55g", price: 20 },
    { label: "Triangles 58g", price: 20 },
  ],
  "parle g": [
    { label: "56g small", price: 5 },
    { label: "132g medium", price: 10 },
    { label: "250g large", price: 20 },
  ],
  colgate: [
    { label: "Strong Teeth 100g", price: 50 },
    { label: "Max Fresh 150g", price: 80 },
    { label: "Sensitive 80g", price: 120 },
  ],
  dove: [
    { label: "Beauty Bar 75g", price: 45 },
    { label: "Beauty Bar 100g", price: 60 },
  ],
};

function getVariants(itemName) {
  const nameLower = itemName.toLowerCase();
  for (const [key, variants] of Object.entries(BUILT_IN_VARIANTS)) {
    if (nameLower.includes(key)) return variants;
  }
  return null;
}

export default function VariantPicker({ item, onSelect, onDismiss }) {
  const [selected, setSelected] = useState(null);
  const variants = getVariants(item.name);

  if (!variants) return null;

  // Auto-select variant that matches current price
  useEffect(() => {
    const match = variants.find((v) => v.price === item.price);
    if (match) setSelected(match);
  }, []);

  function handleConfirm() {
    if (selected) {
      onSelect(selected.label, selected.price);
    } else {
      onDismiss();
    }
  }

  return (
    <div
      style={{
        marginTop: "6px",
        background: "var(--bg)",
        border: "1px solid rgba(232,255,71,0.2)",
        borderRadius: "10px",
        overflow: "hidden",
        animation: "fadeUp 0.2s ease both",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--accent)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Which {item.name}?
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            opacity: 0.5,
          }}
        >
          <X size={12} color="var(--muted)" />
        </button>
      </div>

      {/* Variant options */}
      <div style={{ padding: "6px" }}>
        {variants.map((v, i) => (
          <button
            key={i}
            onClick={() => setSelected(v)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              background:
                selected?.label === v.label ? "rgba(232,255,71,0.08)" : "none",
              border:
                selected?.label === v.label
                  ? "1px solid rgba(232,255,71,0.2)"
                  : "1px solid transparent",
              borderRadius: "7px",
              cursor: "pointer",
              transition: "all 0.12s",
              marginBottom: "2px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color:
                  selected?.label === v.label ? "var(--accent)" : "var(--text)",
              }}
            >
              {v.label}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--muted)",
                }}
              >
                ₹{v.price}
              </span>
              {selected?.label === v.label && (
                <Check size={12} color="var(--accent)" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div
        style={{
          padding: "8px 10px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            flex: 1,
            padding: "7px",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Keep as is
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selected}
          style={{
            flex: 1,
            padding: "7px",
            background: selected ? "var(--accent)" : "var(--bg3)",
            color: selected ? "#0a0a0a" : "var(--muted)",
            border: "none",
            borderRadius: "var(--radius)",
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: "11px",
            cursor: selected ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
