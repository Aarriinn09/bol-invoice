import React, { useState, useEffect } from "react";
import { invoicesAPI } from "../api/client";
import { FileText } from "lucide-react";

export default function PublicInvoicePage({ invoiceNumber, onCreateAccount }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoiceNumber) return;
    invoicesAPI
      .getPublic(invoiceNumber)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Invoice not found");
        setLoading(false);
      });
  }, [invoiceNumber]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--muted)",
        }}
      >
        Loading invoice...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--danger)",
        }}
      >
        {error}
      </div>
    );

  const { invoice, shop_name, items } = data;
  const total = parseFloat(invoice.total);
  const gst = parseFloat(invoice.gst_amount);
  const sub = parseFloat(invoice.subtotal);

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px" }}
    >
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            BOL
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              marginTop: "4px",
            }}
          >
            INVOICE
          </div>
        </div>

        {/* Invoice card */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "fadeUp 0.4s ease both",
          }}
        >
          {/* Invoice meta */}
          <div
            style={{
              background: "var(--bg)",
              borderBottom: "1px solid var(--border)",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--accent)",
                }}
              >
                {shop_name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginTop: "4px",
                }}
              >
                {invoice.invoice_number}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                {new Date(invoice.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {invoice.buyer_name}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            {items?.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 24px",
                  borderBottom:
                    i < items.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
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
              padding: "16px 24px",
              borderTop: "1px solid var(--border)",
              background: "var(--bg)",
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
                ₹{sub.toFixed(2)}
              </span>
            </div>
            {invoice.gst_rate > 0 && (
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
                  GST ({invoice.gst_rate}%)
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                  }}
                >
                  ₹{gst.toFixed(2)}
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
                TOTAL
              </span>
              <span
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: "20px",
                  color: "var(--accent)",
                }}
              >
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Create account prompt */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            textAlign: "center",
            animation: "fadeUp 0.4s 0.1s ease both",
          }}
        >
          <FileText
            size={20}
            color="var(--accent)"
            style={{ marginBottom: "8px" }}
          />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              marginBottom: "6px",
            }}
          >
            Want to track all your purchases?
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "16px",
            }}
          >
            Create a free BOL account to see invoices from all your shops in one
            place.
          </p>
          <button
            onClick={onCreateAccount}
            style={{
              background: "var(--accent)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "10px 24px",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
