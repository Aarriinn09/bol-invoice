import React, { useState, useEffect } from "react";
import { customerAPI } from "../api/client";
import {
  ShoppingBag,
  TrendingUp,
  Calendar,
  ChevronRight,
  X,
  LogOut,
  Package,
  Store,
  Clock,
} from "lucide-react";
import { BarChart2 } from "lucide-react";
import BudgetTracker from "../components/BudgetTracker";
import CustomerAnalyticsPage from "./CustomerAnalyticsPage";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffHrs = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return `${Math.floor(diffDays)} days ago`;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return `₹${parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getMonthSpend(invoices) {
  const now = new Date();
  return invoices
    .filter((inv) => {
      const d = new Date(inv.created_at);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, inv) => s + parseFloat(inv.total), 0);
}

// ── Invoice Drawer ────────────────────────────────────────────────────────────
function InvoiceDrawer({ invoice, onClose }) {
  if (!invoice) return null;

  const total = parseFloat(invoice.total);
  const gst = parseFloat(invoice.gst_amount);
  const sub = parseFloat(invoice.subtotal);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--bg2)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border)",
          borderBottom: "none",
          maxHeight: "85vh",
          overflowY: "auto",
          zIndex: 201,
          animation: "slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "var(--border2)",
            borderRadius: "2px",
            margin: "12px auto 0",
          }}
        />

        <div style={{ padding: "20px 24px 40px" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "18px",
                  marginBottom: "4px",
                }}
              >
                {invoice.buyer_name || "Invoice"}
              </div>
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
                    fontSize: "11px",
                    color: "var(--muted)",
                  }}
                >
                  {invoice.invoice_number}
                </span>
                <span
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "var(--muted)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                  }}
                >
                  {formatDate(invoice.created_at)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={15} color="var(--muted)" />
            </button>
          </div>

          {/* Items */}
          <div
            style={{
              background: "var(--bg)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            {invoice.items?.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom:
                    i < invoice.items.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "var(--bg2)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Package size={14} color="var(--muted)" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      {item.product_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--muted)",
                      }}
                    >
                      {item.qty} × {formatAmount(item.price)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {formatAmount(item.total)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div
            style={{
              background: "var(--bg)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--muted)",
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
              >
                {formatAmount(sub)}
              </span>
            </div>
            {invoice.gst_rate > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--muted)",
                  }}
                >
                  GST ({invoice.gst_rate}%)
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                  }}
                >
                  {formatAmount(gst)}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                marginTop: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                Total paid
              </span>
              <span
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: "20px",
                  color: "var(--accent)",
                }}
              >
                {formatAmount(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CustomerDashboard({ customer, onLogout }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    customerAPI
      .getInvoices()
      .then((data) => {
        // Sort latest first
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setInvoices(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalSpent = invoices.reduce((s, inv) => s + parseFloat(inv.total), 0);
  const monthSpend = getMonthSpend(invoices);
  const shopsVisited = new Set(invoices.map((inv) => inv.buyer_name)).size;

  if (showAnalytics) {
    return (
      <CustomerAnalyticsPage
        customer={customer}
        onBack={() => setShowAnalytics(false)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {/* ── Top header ── */}
      <div
        style={{
          padding: "48px 24px 24px",
          background: "linear-gradient(180deg, #111111 0%, var(--bg) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              BOL WALLET
            </div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {customer.name || customer.email}
            </div>
          </div>
          <button
            onClick={() => setShowAnalytics(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "8px 14px",
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
              marginRight: "8px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <BarChart2 size={13} /> Analytics
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--danger)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>

        {/* Total spent — big hero number */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "6px",
            }}
          >
            Total spent
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "40px",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            {formatAmount(totalSpent)}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
          }}
        >
          {[
            {
              icon: ShoppingBag,
              label: "Invoices",
              value: invoices.length,
            },
            {
              icon: TrendingUp,
              label: "This month",
              value: formatAmount(monthSpend),
            },
            {
              icon: Store,
              label: "Shops",
              value: shopsVisited,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <Icon
                size={14}
                color="var(--muted)"
                style={{ marginBottom: "6px" }}
              />
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "15px",
                  marginBottom: "2px",
                  color: "var(--text)",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--muted)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BudgetTracker monthSpend={monthSpend} customerId={customer.id} />
      {/* ── Invoice list ── */}
      <div style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            Purchase history
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
            }}
          >
            {invoices.length} total
          </span>
        </div>

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            Loading your purchases...
          </div>
        )}

        {!loading && invoices.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
            }}
          >
            <ShoppingBag
              size={40}
              color="var(--muted)"
              style={{ opacity: 0.3, marginBottom: "16px" }}
            />
            <p
              style={{
                fontFamily: "var(--font-head)",
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              No purchases yet
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              Invoices sent to you by vendors will appear here automatically.
            </p>
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {invoices.map((inv, idx) => {
              const isNew =
                idx === 0 &&
                new Date() - new Date(inv.created_at) < 1000 * 60 * 60 * 24;

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelected(inv)}
                  style={{
                    background: "var(--bg2)",
                    border: `1px solid ${isNew ? "rgba(232,255,71,0.2)" : "var(--border)"}`,
                    borderRadius: "14px",
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = isNew
                      ? "rgba(232,255,71,0.2)"
                      : "var(--border)")
                  }
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      background: isNew ? "rgba(232,255,71,0.1)" : "var(--bg3)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Store
                      size={18}
                      color={isNew ? "var(--accent)" : "var(--muted)"}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inv.buyer_name || "Purchase"}
                      </span>
                      {isNew && (
                        <span
                          style={{
                            background: "rgba(232,255,71,0.15)",
                            color: "var(--accent)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.05em",
                            flexShrink: 0,
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Clock size={10} color="var(--muted)" />
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "var(--muted)",
                        }}
                      >
                        {formatDate(inv.created_at)}
                      </span>
                      <span
                        style={{
                          width: "3px",
                          height: "3px",
                          borderRadius: "50%",
                          background: "var(--muted)",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "var(--muted)",
                        }}
                      >
                        {inv.items?.length || 0} items
                      </span>
                    </div>
                  </div>

                  {/* Amount + chevron */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-head)",
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "var(--accent)",
                      }}
                    >
                      {formatAmount(inv.total)}
                    </span>
                    <ChevronRight size={14} color="var(--muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice detail drawer */}
      {selected && (
        <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
