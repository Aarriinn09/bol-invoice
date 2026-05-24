import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, FileText, TrendingUp } from "lucide-react";
import { invoicesAPI } from "../api/client";

function fmt(amount) {
  return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function PeriodSelector({ active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: "var(--bg3)",
        borderRadius: "10px",
        padding: "3px",
      }}
    >
      {[
        { key: "week", label: "This Week" },
        { key: "month", label: "This Month" },
        { key: "all", label: "All Time" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: "7px 14px",
            background: active === key ? "var(--accent)" : "none",
            color: active === key ? "#0a0a0a" : "var(--muted)",
            border: "none",
            borderRadius: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: active === key ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const SLAB_COLORS = {
  "0%": "#4ade80",
  "5%": "#38bdf8",
  "12%": "#a78bfa",
  "18%": "#e8ff47",
  "28%": "#f87171",
};

export default function GSTDashboard({ onBack, vendor }) {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    invoicesAPI
      .getGSTSummary(period)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  function handleExport() {
    const url = invoicesAPI.downloadGSTR1(period);
    const token = localStorage.getItem("bol_token");
    // Create a temporary link with auth
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `GSTR1_${period}.csv`;
        a.click();
      });
  }

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      {/* Page title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "22px",
              marginBottom: "4px",
            }}
          >
            GST Dashboard
          </h2>
          {vendor && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              {vendor.shop_name}
            </p>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(232,255,71,0.08)",
            border: "1px solid rgba(232,255,71,0.25)",
            borderRadius: "var(--radius)",
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            padding: "7px 14px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(232,255,71,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(232,255,71,0.08)")
          }
        >
          <Download size={13} /> Export GSTR-1
        </button>
      </div>

      <PeriodSelector active={period} onChange={setPeriod} />

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "80px",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--muted)",
          }}
        >
          Loading GST data...
        </div>
      )}

      {data && !loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {[
              {
                label: "Taxable Amount",
                value: fmt(data.total_taxable),
                color: "var(--text)",
              },
              {
                label: "CGST Collected",
                value: fmt(data.total_cgst),
                color: "#38bdf8",
              },
              {
                label: "SGST Collected",
                value: fmt(data.total_sgst),
                color: "#a78bfa",
              },
              {
                label: "Total GST",
                value: fmt(data.total_gst),
                color: "var(--accent)",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 800,
                    fontSize: "20px",
                    color,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Slab table */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TrendingUp size={14} color="var(--accent)" />
              <span
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                GST Slab Breakdown
              </span>
            </div>

            {data.slabs.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--muted)",
                }}
              >
                No GST data for this period
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {[
                        "Rate",
                        "Taxable",
                        "CGST",
                        "SGST",
                        "Total GST",
                        "Count",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            textAlign:
                              h === "Rate" || h === "Count"
                                ? "center"
                                : "right",
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            color: "var(--muted)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid var(--border)",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slabs.map((slab) => {
                      const color = SLAB_COLORS[slab.rate] || "var(--text)";
                      return (
                        <tr
                          key={slab.rate}
                          style={{
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                background: `${color}15`,
                                color,
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "6px",
                                border: `1px solid ${color}30`,
                              }}
                            >
                              {slab.rate}
                            </span>
                          </td>
                          {[
                            slab.taxable_amount,
                            slab.cgst,
                            slab.sgst,
                            slab.total_gst,
                          ].map((val, i) => (
                            <td
                              key={i}
                              style={{
                                padding: "12px 16px",
                                textAlign: "right",
                                fontFamily: "var(--font-mono)",
                                fontSize: "13px",
                                color:
                                  i === 3 ? "var(--accent)" : "var(--text)",
                                fontWeight: i === 3 ? 600 : 400,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmt(val)}
                            </td>
                          ))}
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              fontFamily: "var(--font-mono)",
                              fontSize: "13px",
                              color: "var(--muted)",
                            }}
                          >
                            {slab.invoice_count}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr style={{ background: "var(--bg3)" }}>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          fontFamily: "var(--font-head)",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {fmt(data.total_taxable)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#38bdf8",
                        }}
                      >
                        {fmt(data.total_cgst)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#a78bfa",
                        }}
                      >
                        {fmt(data.total_sgst)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        {fmt(data.total_gst)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: "13px",
                          color: "var(--muted)",
                        }}
                      >
                        {data.slabs.reduce((s, sl) => s + sl.invoice_count, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GSTR-1 export */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FileText size={20} color="var(--accent)" />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 600,
                    fontSize: "15px",
                    marginBottom: "4px",
                  }}
                >
                  GSTR-1 Export
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Download CSV ready for GST portal upload
                </div>
              </div>
            </div>
            <button
              onClick={handleExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--accent)",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "10px 18px",
                cursor: "pointer",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
