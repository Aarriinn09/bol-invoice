import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  Loader,
} from "lucide-react";

export default function ProductManager({
  customProducts,
  loading,
  onAdd,
  onRemove,
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");
  const [adding, setAdding] = useState(false);

  // Auto-generate aliases — vendor never sees this
  function generateAliases(productName) {
    const base = productName.toLowerCase().trim();
    const words = base.split(" ");
    const aliases = [base];

    for (const word of words) {
      if (word.length > 3 && !aliases.includes(word)) {
        aliases.push(word);
      }
    }
    if (words.length > 1) aliases.push(words.join(""));
    if (words.length > 2)
      aliases.push(`${words[0]} ${words[words.length - 1]}`);

    return aliases;
  }

  async function handleAdd() {
    setError("");
    if (!name.trim()) {
      setError("Please enter a product name");
      return;
    }

    setAdding(true);
    const result = await onAdd({
      name: name.trim(),
      defaultPrice: parseFloat(price) || 0,
      aliases: generateAliases(name.trim()),
      category: "custom",
    });
    setAdding(false);

    if (result.success) {
      setAdded(`"${name.trim()}" added!`);
      setName("");
      setPrice("");
      setTimeout(() => setAdded(""), 2500);
    } else {
      setError(result.error);
    }
  }

  const inputStyle = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    padding: "10px 14px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
  };

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
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          borderBottom: open ? "1px solid var(--border)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Package size={14} color="var(--accent)" />
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 600,
              fontSize: "13px",
              color: "var(--text)",
            }}
          >
            My Products
          </span>

          {/* Loading indicator */}
          {loading && (
            <Loader
              size={12}
              color="var(--muted)"
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}

          {/* Count badge */}
          {!loading && customProducts.length > 0 && (
            <span
              style={{
                background: "rgba(232,255,71,0.12)",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              {customProducts.length}
            </span>
          )}
        </div>

        {open ? (
          <ChevronUp size={14} color="var(--muted)" />
        ) : (
          <ChevronDown size={14} color="var(--muted)" />
        )}
      </button>

      {open && (
        <div style={{ padding: "16px 20px" }}>
          {/* Add form — name + price only */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Product name"
              style={{ ...inputStyle, flex: 2 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Price"
              style={{ ...inputStyle, flex: 1 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              style={{
                background: adding ? "var(--bg3)" : "var(--accent)",
                color: adding ? "var(--muted)" : "#0a0a0a",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "10px 16px",
                cursor: adding ? "not-allowed" : "pointer",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "13px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s",
              }}
            >
              {adding ? (
                <Loader
                  size={13}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Plus size={13} />
              )}
              {adding ? "Adding..." : "Add"}
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--danger)",
                marginBottom: "8px",
              }}
            >
              {error}
            </p>
          )}
          {added && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--success)",
                marginBottom: "8px",
              }}
            >
              ✓ {added}
            </p>
          )}

          {/* Loading state */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              Loading your products...
            </div>
          )}

          {/* Empty state */}
          {!loading && customProducts.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--muted)",
                borderTop: "1px solid var(--border)",
                marginTop: "4px",
              }}
            >
              No custom products yet. Add items your shop sells.
            </div>
          )}

          {/* Product list */}
          {!loading && customProducts.length > 0 && (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                marginTop: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "240px",
                overflowY: "auto",
              }}
            >
              {customProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--bg3)",
                    borderRadius: "var(--radius)",
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {p.name}
                    </span>
                    {p.defaultPrice > 0 && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "var(--muted)",
                        }}
                      >
                        ₹{p.defaultPrice}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--muted)",
                        background: "var(--bg)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      opacity: 0.4,
                      transition: "opacity 0.15s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0.4")
                    }
                  >
                    <Trash2 size={13} color="var(--danger)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
