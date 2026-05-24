import React, { useState, useEffect } from "react";
import { Target, Edit3, Check, X, AlertTriangle } from "lucide-react";

export default function BudgetTracker({ monthSpend, customerId }) {
  const STORAGE_KEY = `bol_budget_${customerId}`; // ← unique per customer

  const [budget, setBudget] = useState(0);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  // Load saved budget for THIS customer only
  useEffect(() => {
    if (!customerId) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBudget(parseFloat(saved));
    else setBudget(0); // reset if switching accounts
  }, [customerId]); // ← re-runs when customer changes

  function saveBudget() {
    const val = parseFloat(input);
    if (!val || val <= 0) {
      setEditing(false);
      return;
    }
    setBudget(val);
    localStorage.setItem(STORAGE_KEY, val.toString());
    setEditing(false);
  }

  function clearBudget() {
    setBudget(0);
    localStorage.removeItem(STORAGE_KEY);
    setEditing(false);
  }

  const pct = budget > 0 ? Math.min((monthSpend / budget) * 100, 100) : 0;
  const overBudget = monthSpend > budget && budget > 0;
  const nearLimit = pct >= 80 && pct < 100;

  const barColor = overBudget
    ? "var(--danger)"
    : nearLimit
      ? "#fb923c"
      : "var(--success)";

  if (!customerId) return null;

  // No budget set
  if (!budget && !editing) {
    return (
      <div
        onClick={() => {
          setInput("");
          setEditing(true);
        }}
        style={{
          background: "var(--bg2)",
          border: "1px dashed var(--border2)",
          borderRadius: "14px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border2)")
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Target size={16} color="var(--muted)" />
          <div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Set monthly budget
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
              }}
            >
              Track your spending against a limit
            </div>
          </div>
        </div>
        <Edit3 size={14} color="var(--muted)" />
      </div>
    );
  }

  // Editing mode
  if (editing) {
    return (
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--accent)",
          borderRadius: "14px",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 600,
            fontSize: "14px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Target size={15} color="var(--accent)" />
          Set monthly budget
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                color: "var(--muted)",
              }}
            >
              ₹
            </span>
            <input
              autoFocus
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveBudget();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder="5000"
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: "15px",
                padding: "10px 14px 10px 28px",
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={saveBudget}
            style={{
              background: "var(--accent)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "10px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            <Check size={14} /> Set
          </button>
          <button
            onClick={() => setEditing(false)}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            <X size={14} color="var(--muted)" />
          </button>
        </div>
      </div>
    );
  }

  // Budget set — show tracker
  return (
    <div
      style={{
        background: overBudget
          ? "rgba(248,113,113,0.06)"
          : nearLimit
            ? "rgba(251,146,60,0.06)"
            : "var(--bg2)",
        border: `1px solid ${
          overBudget
            ? "rgba(248,113,113,0.2)"
            : nearLimit
              ? "rgba(251,146,60,0.2)"
              : "var(--border)"
        }`,
        borderRadius: "14px",
        padding: "16px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {overBudget || nearLimit ? (
            <AlertTriangle size={15} color={barColor} />
          ) : (
            <Target size={15} color="var(--accent)" />
          )}
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Monthly Budget
          </span>
        </div>
        <button
          onClick={() => {
            setInput(budget.toString());
            setEditing(true);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            opacity: 0.5,
          }}
          title="Edit budget"
        >
          <Edit3 size={13} color="var(--muted)" />
        </button>
      </div>

      {/* Amount row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "10px",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 800,
              fontSize: "22px",
              color: barColor,
            }}
          >
            ₹{monthSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--muted)",
              marginLeft: "6px",
            }}
          >
            / ₹{budget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 600,
            color: barColor,
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "8px",
          background: "var(--bg3)",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: "4px",
            transition: "width 0.6s ease",
          }}
        />
      </div>

      {/* Alert message */}
      {overBudget && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <AlertTriangle size={11} />
          Over budget by ₹
          {Math.round(monthSpend - budget).toLocaleString("en-IN")}
        </div>
      )}
      {nearLimit && !overBudget && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "#fb923c",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <AlertTriangle size={11} />
          Almost at limit — ₹
          {Math.round(budget - monthSpend).toLocaleString("en-IN")} remaining
        </div>
      )}
      {!nearLimit && !overBudget && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          ₹{Math.round(budget - monthSpend).toLocaleString("en-IN")} remaining
          this month
        </div>
      )}

      <button
        onClick={clearBudget}
        style={{
          background: "none",
          border: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--muted)",
          cursor: "pointer",
          marginTop: "8px",
          padding: 0,
          textDecoration: "underline",
        }}
      >
        Clear budget
      </button>
    </div>
  );
}
