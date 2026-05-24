import React, { useState, useEffect } from "react";
import { invoicesAPI } from "../api/client";
import { FileText, ChevronRight, X } from "lucide-react";
import { SkeletonList } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

function StatusBadge({ status }) {
  const colors = {
    draft: { bg: "rgba(96,96,96,0.15)", color: "var(--muted)" },
    sent: { bg: "rgba(232,255,71,0.12)", color: "var(--accent)" },
    paid: { bg: "rgba(74,222,128,0.12)", color: "var(--success)" },
  };
  const c = colors[status] || colors.draft;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        padding: "2px 8px",
        borderRadius: "20px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {status}
    </span>
  );
}

function InvoiceDrawer({ invoice, onClose, onStatusChange }) {
  if (!invoice) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
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

        <div style={{ padding: "20px 24px 48px" }}>
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
                {invoice.buyer_name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {invoice.invoice_number} ·{" "}
                {new Date(invoice.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
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
              marginBottom: "14px",
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
                    {item.qty} × ₹{parseFloat(item.price).toFixed(2)}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  ₹{parseFloat(item.total).toFixed(2)}
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
              marginBottom: "16px",
            }}
          >
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
                  fontSize: "13px",
                  color: "var(--muted)",
                }}
              >
                Subtotal
              </span>
              <span
                style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
              >
                ₹{parseFloat(invoice.subtotal).toFixed(2)}
              </span>
            </div>
            {invoice.gst_rate > 0 && (
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
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    CGST ({invoice.gst_rate / 2}%)
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                    }}
                  >
                    ₹{(parseFloat(invoice.gst_amount) / 2).toFixed(2)}
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
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    SGST ({invoice.gst_rate / 2}%)
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                    }}
                  >
                    ₹{(parseFloat(invoice.gst_amount) / 2).toFixed(2)}
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
                marginTop: "6px",
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
                ₹{parseFloat(invoice.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Status update */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Update status
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["draft", "sent", "paid"].map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(invoice.id, s)}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    border: `1px solid ${
                      invoice.status === s ? "var(--accent)" : "var(--border)"
                    }`,
                    borderRadius: "var(--radius)",
                    background:
                      invoice.status === s ? "rgba(232,255,71,0.1)" : "none",
                    color:
                      invoice.status === s ? "var(--accent)" : "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HistoryPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    invoicesAPI
      .getAll()
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  async function handleStatusChange(id, status) {
    try {
      await invoicesAPI.updateStatus(id, status);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
      );
      setSelected((prev) => (prev ? { ...prev, status } : prev));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      {/* Page title */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: "22px",
            marginBottom: "4px",
          }}
        >
          Invoice History
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          {invoices.length > 0
            ? `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} total`
            : "All your saved invoices"}
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && <SkeletonList count={5} />}

      {/* Error */}
      {error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--danger)",
            textAlign: "center",
            padding: "40px",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && invoices.length === 0 && (
        <EmptyState
          illustration="invoice"
          title="No invoices yet"
          description="Create your first invoice and it will appear here."
        />
      )}

      {/* Invoice list */}
      {!loading && invoices.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {invoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => setSelected(inv)}
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--border2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
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
                    {inv.buyer_name}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{inv.invoice_number}</span>
                  <span>·</span>
                  <span>
                    {new Date(inv.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{inv.items?.length || 0} items</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexShrink: 0,
                  marginLeft: "12px",
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
                  ₹{parseFloat(inv.total).toFixed(2)}
                </span>
                <ChevronRight size={14} color="var(--muted)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice detail drawer */}
      {selected && (
        <InvoiceDrawer
          invoice={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
