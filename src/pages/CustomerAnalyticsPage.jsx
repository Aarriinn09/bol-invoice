import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Store,
  Package,
  ArrowLeft,
  PieChart as PieIcon,
  X,
} from "lucide-react";
import { customerAPI } from "../api/client";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(amount) {
  return `₹${parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function fmtFull(amount) {
  return `₹${parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const CATEGORY_COLORS = {
  Snacks: "#e8ff47",
  Beverages: "#4ade80",
  Chocolate: "#f97316",
  Biscuits: "#a78bfa",
  Instant: "#38bdf8",
  Personal: "#f472b6",
  Household: "#fb923c",
  Dairy: "#34d399",
  Staples: "#94a3b8",
  Other: "#6b7280",
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
      }}
    >
      <div style={{ color: "var(--muted)", marginBottom: "4px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: "var(--accent)", fontWeight: 600 }}>
          {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "var(--accent)" }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "18px 20px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: "30px",
            height: "30px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={color} />
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-head)",
          fontWeight: 800,
          fontSize: "26px",
          color,
          letterSpacing: "-0.5px",
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--muted)",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Period selector ───────────────────────────────────────────────────────────
function PeriodSelector({ active, onChange }) {
  const options = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];
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
      {options.map(({ key, label }) => (
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
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Icon size={14} color="var(--accent)" />
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </div>
  );
}

// ── Custom pie label ──────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct, name }) {
  if (pct < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#0a0a0a"
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 600,
      }}
    >
      {`${pct}%`}
    </text>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CustomerAnalyticsPage({ customer, onBack }) {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    customerAPI
      .getAnalytics(period)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [period]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: "58px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={18} color="var(--muted)" />
        </button>
        <div>
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            My Spending
          </span>
          {customer?.name && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                marginLeft: "8px",
              }}
            >
              {customer.name}
            </span>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Period selector */}
        <div style={{ overflowX: "auto" }}>
          <PeriodSelector active={period} onChange={setPeriod} />
        </div>

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
            Loading your spending data...
          </div>
        )}

        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* Summary stats */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <StatCard
                icon={TrendingUp}
                label="Total Spent"
                value={fmt(data.summary.total_spent)}
                sub={`Avg bill: ${fmtFull(data.summary.avg_bill)}`}
                color="var(--accent)"
              />
              <StatCard
                icon={ShoppingBag}
                label="Purchases"
                value={data.summary.total_invoices}
                sub={`This month: ${fmt(data.summary.this_month)}`}
                color="var(--success)"
              />
              <StatCard
                icon={Store}
                label="Shops"
                value={data.vendor_breakdown.length}
                sub="Unique vendors"
                color="#a78bfa"
              />
            </div>

            {/* Spend over time chart */}
            {data.spend_chart.length > 1 && (
              <Section title="Spending Over Time" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={data.spend_chart}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fill: "var(--muted)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fill: "var(--muted)",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="spend"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "var(--accent)",
                        strokeWidth: 0,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Section>
            )}

            {/* Category breakdown + Vendor breakdown side by side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {/* Category spend pie chart */}
              {data.category_spend.length > 0 && (
                <Section title="Spend by Category" icon={PieIcon}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {/* Pie chart */}
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={data.category_spend}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={80}
                          labelLine={false}
                          label={PieLabel}
                        >
                          {data.category_spend.map((entry) => (
                            <Cell
                              key={entry.category}
                              fill={
                                CATEGORY_COLORS[entry.category] || "#6b7280"
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [fmt(value), name]}
                          contentStyle={{
                            background: "var(--bg2)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {data.category_spend.map((cat) => (
                        <div
                          key={cat.category}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "3px",
                                background:
                                  CATEGORY_COLORS[cat.category] || "#6b7280",
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "13px",
                              }}
                            >
                              {cat.category}
                            </span>
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
                              {cat.pct}%
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {fmt(cat.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              )}

              {/* Vendor breakdown */}
              {data.vendor_breakdown.length > 0 && (
                <Section title="Shops Visited" icon={Store}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {data.vendor_breakdown.map((v, i) => (
                      <div
                        key={v.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {/* Rank */}
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            background:
                              i === 0 ? "rgba(232,255,71,0.12)" : "var(--bg3)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: i === 0 ? "var(--accent)" : "var(--muted)",
                            }}
                          >
                            {i + 1}
                          </span>
                        </div>

                        {/* Name + bar */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "13px",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {v.name}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                color: "var(--muted)",
                                flexShrink: 0,
                                marginLeft: "8px",
                              }}
                            >
                              {v.visits}x
                            </span>
                          </div>
                          <div
                            style={{
                              height: "4px",
                              background: "var(--bg3)",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.round(
                                  (v.total / data.vendor_breakdown[0].total) *
                                    100,
                                )}%`,
                                background:
                                  i === 0 ? "var(--accent)" : "var(--border2)",
                                borderRadius: "2px",
                                transition: "width 0.6s ease",
                              }}
                            />
                          </div>
                        </div>

                        {/* Amount */}
                        <span
                          style={{
                            fontFamily: "var(--font-head)",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: i === 0 ? "var(--accent)" : "var(--text)",
                            flexShrink: 0,
                          }}
                        >
                          {fmt(v.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Top items bar chart */}
            {data.top_items.length > 0 && (
              <Section title="Most Purchased Items" icon={Package}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={data.top_items.slice(0, 7)}
                    margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fill: "var(--muted)",
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fill: "var(--muted)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} units`, "Quantity"]}
                      contentStyle={{
                        background: "var(--bg2)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="qty"
                      fill="var(--accent)"
                      radius={[0, 3, 3, 0]}
                      opacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Section>
            )}

            {/* Empty state */}
            {data.summary.total_invoices === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                }}
              >
                <ShoppingBag
                  size={36}
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
                  No data for this period
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  Your spending analytics will appear here once vendors send you
                  invoices.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
