import React, { useState } from "react";
import { Trash2, Edit3, Check, AlertTriangle } from "lucide-react";
import MatchBadge from "./MatchBadge";
import GSTBadge from "./GSTBadge";
import { useGSTLookup } from "../hooks/useGSTLookup";
import VariantPicker from "./VariantPicker";

function EditableCell({ value, onSave, type = "text" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  React.useEffect(() => {
    setVal(value);
  }, [value]);

  function commit() {
    const parsed = type === "number" ? parseFloat(val) : val;
    if (type === "number" && isNaN(parsed)) {
      setVal(value);
      setEditing(false);
      return;
    }
    onSave(type === "number" ? parsed : val);
    setEditing(false);
  }

  if (editing)
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        <input
          autoFocus
          type={type}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setVal(value);
              setEditing(false);
            }
          }}
          style={{
            background: "var(--bg)",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            padding: "3px 7px",
            width: type === "number" ? "72px" : "130px",
            outline: "none",
          }}
        />
        <Check
          size={12}
          color="var(--success)"
          style={{ cursor: "pointer", flexShrink: 0 }}
          onClick={commit}
        />
      </span>
    );

  return (
    <span
      onClick={() => {
        setVal(value);
        setEditing(true);
      }}
      style={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
      }}
      title="Click to edit"
    >
      {value}
      <Edit3 size={10} color="var(--muted)" />
    </span>
  );
}

export default function InvoicePreview({
  result,
  settings,
  invoiceNumber,
  date,
  onUpdate,
  vendor,
}) {
  if (!result) return null;

  const { items, subtotal, errors } = result;
  const gst = parseFloat(((subtotal * settings.gstRate) / 100).toFixed(2));
  const total = parseFloat((subtotal + gst).toFixed(2));
  const gstMap = useGSTLookup(items);
  const showGSTBadge = !!vendor?.gstin;
  const [dismissedVariants, setDismissedVariants] = useState({});

  function updateItem(idx, field, value) {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const next = { ...item, [field]: value };
      next.total = parseFloat((next.qty * next.price).toFixed(2));
      return next;
    });
    const newSubtotal = parseFloat(
      updated.reduce((s, i) => s + i.total, 0).toFixed(2),
    );
    onUpdate({ items: updated, subtotal: newSubtotal, errors });
  }

  // Add this function after updateItem
  function updateItemMultiple(idx, fields) {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const next = { ...item, ...fields };
      next.total = parseFloat((next.qty * next.price).toFixed(2));
      return next;
    });
    const newSubtotal = parseFloat(
      updated.reduce((s, i) => s + i.total, 0).toFixed(2),
    );
    onUpdate({ items: updated, subtotal: newSubtotal, errors });
  }

  function acceptMatch(idx, name, price) {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const next = {
        ...item,
        name,
        ...(price && price > 0 ? { price } : {}),
        matchResult: null,
        suggestedName: null,
        suggestedPrice: null,
      };
      next.total = parseFloat((next.qty * next.price).toFixed(2));
      return next;
    });
    const newSubtotal = parseFloat(
      updated.reduce((s, i) => s + i.total, 0).toFixed(2),
    );
    onUpdate({ items: updated, subtotal: newSubtotal, errors });
  }

  function rejectMatch(idx) {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      return {
        ...item,
        matchResult: null,
        suggestedName: null,
        suggestedPrice: null,
      };
    });
    onUpdate({ items: updated, subtotal, errors });
  }

  function removeItem(idx) {
    const updated = items.filter((_, i) => i !== idx);
    const newSubtotal = parseFloat(
      updated.reduce((s, i) => s + i.total, 0).toFixed(2),
    );
    onUpdate({ items: updated, subtotal: newSubtotal, errors });
  }

  const th = {
    padding: "10px 14px",
    textAlign: "left",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--muted)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    borderBottom: "1px solid var(--border)",
  };

  const td = {
    padding: "11px 14px",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    color: "var(--text)",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "top",
  };

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        animation: "fadeUp 0.35s ease both",
      }}
    >
      {/* Invoice header */}
      <div
        style={{
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 800,
              fontSize: "20px",
              color: "var(--accent)",
              marginBottom: "2px",
            }}
          >
            BOL
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
            }}
          >
            {settings.shopName || "My Shop"}
          </div>
          {vendor?.gstin && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--muted)",
                marginTop: "2px",
              }}
            >
              GSTIN: {vendor.gstin}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            {invoiceNumber}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              marginTop: "2px",
            }}
          >
            {date}
          </div>
          {settings.buyerName && (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              To: {settings.buyerName}
            </div>
          )}
        </div>
      </div>

      {/* Parse errors */}
      {errors?.length > 0 && (
        <div
          style={{
            background: "rgba(248,113,113,0.07)",
            borderBottom: "1px solid rgba(248,113,113,0.15)",
            padding: "10px 20px",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle
            size={13}
            color="var(--danger)"
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <div>
            {errors.map((e, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--danger)",
                }}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "32px" }}>#</th>
              <th style={th}>Item</th>
              <th style={{ ...th, textAlign: "center" }}>Qty</th>
              <th style={{ ...th, textAlign: "right" }}>Price</th>
              <th style={{ ...th, textAlign: "right" }}>Total</th>
              <th style={{ ...th, width: "36px" }} />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ ...td, color: "var(--muted)", fontSize: "11px" }}>
                  {i + 1}
                </td>

                {/* Name cell */}
                <td style={td}>
                  <EditableCell
                    value={item.name}
                    onSave={(v) => updateItem(i, "name", v)}
                  />

                  {/* GST badge — only for registered GST vendors */}
                  {showGSTBadge && gstMap[item.name] && (
                    <GSTBadge
                      rate={gstMap[item.name].gst_rate}
                      hsn={gstMap[item.name].hsn_code}
                      matched={gstMap[item.name].matched}
                    />
                  )}

                  {/* Match suggestion badge */}
                  {item.matchResult?.matched &&
                    item.matchResult?.matchType !== "exact" &&
                    item.name !== item.suggestedName && (
                      <MatchBadge
                        item={item}
                        onAccept={(name, price) => acceptMatch(i, name, price)}
                        onReject={() => rejectMatch(i)}
                      />
                    )}

                  {/* Variant picker — shows if variants exist and not dismissed */}
                  {!dismissedVariants[i] && (
                    <VariantPicker
                      item={item}
                      onSelect={(label, price) => {
                        // Update name AND price in one atomic call
                        updateItemMultiple(i, {
                          name: `${item.name.split("(")[0].trim()} (${label})`,
                          price: price,
                        });
                        setDismissedVariants((prev) => ({
                          ...prev,
                          [i]: true,
                        }));
                      }}
                      onDismiss={() =>
                        setDismissedVariants((prev) => ({ ...prev, [i]: true }))
                      }
                    />
                  )}
                </td>

                <td style={{ ...td, textAlign: "center" }}>
                  <EditableCell
                    value={item.qty}
                    type="number"
                    onSave={(v) => updateItem(i, "qty", v)}
                  />
                </td>

                <td style={{ ...td, textAlign: "right" }}>
                  ₹
                  <EditableCell
                    value={item.price}
                    type="number"
                    onSave={(v) => updateItem(i, "price", v)}
                  />
                </td>

                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  ₹{item.total.toFixed(2)}
                </td>

                <td style={td}>
                  <button
                    onClick={() => removeItem(i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      opacity: 0.4,
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0.4")
                    }
                  >
                    <Trash2 size={13} color="var(--danger)" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ minWidth: "200px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            >
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          {settings.gstRate > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  CGST ({settings.gstRate / 2}%)
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                  }}
                >
                  ₹{(gst / 2).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  SGST ({settings.gstRate / 2}%)
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                  }}
                >
                  ₹{(gst / 2).toFixed(2)}
                </span>
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border)",
              paddingTop: "10px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              TOTAL
            </span>
            <span
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 800,
                fontSize: "18px",
                color: "var(--accent)",
              }}
            >
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
