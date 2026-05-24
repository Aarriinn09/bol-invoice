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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  AlertCircle,
  ArrowLeft,
  Package,
  Clock,
  Star,
  UserX,
  UserPlus,
  Zap,
  Activity,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { invoicesAPI } from "../api/client";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(amount) {
  return `₹${parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function fmtFull(amount) {
  return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function GrowthBadge({ pct }) {
  if (pct === 0) return null;
  const up = pct > 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: up ? "var(--success)" : "var(--danger)",
        background: up ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
        padding: "2px 7px",
        borderRadius: "20px",
      }}
    >
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(pct)}%
    </span>
  );
}

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
          {p.name === "revenue" || p.name === "spend" ? fmt(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

// ── Insight icon map ──────────────────────────────────────────────────────────
const INSIGHT_ICONS = {
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  today: Zap,
  clock: Clock,
  star: Star,
  user_x: UserX,
  alert: AlertCircle,
  basket: ShoppingCart,
  user_plus: UserPlus,
};

const INSIGHT_COLORS = {
  positive: {
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.2)",
    text: "var(--success)",
  },
  warning: {
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.2)",
    text: "#fb923c",
  },
  danger: {
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.2)",
    text: "var(--danger)",
  },
  info: {
    bg: "rgba(232,255,71,0.06)",
    border: "rgba(232,255,71,0.15)",
    text: "var(--accent)",
  },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "var(--accent)",
  growth,
}) {
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
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {sub && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
            }}
          >
            {sub}
          </span>
        )}
        {growth !== undefined && <GrowthBadge pct={growth} />}
      </div>
    </div>
  );
}

// ── Period selector ───────────────────────────────────────────────────────────
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
        { key: "today", label: "Today" },
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

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ risk }) {
  const config = {
    low: {
      color: "var(--success)",
      bg: "rgba(74,222,128,0.1)",
      label: "Low risk",
    },
    medium: { color: "#fb923c", bg: "rgba(251,146,60,0.1)", label: "Medium" },
    high: {
      color: "var(--danger)",
      bg: "rgba(248,113,113,0.1)",
      label: "High risk",
    },
  };
  const c = config[risk] || config.low;
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: c.color,
        background: c.bg,
        padding: "2px 8px",
        borderRadius: "20px",
        fontWeight: 600,
      }}
    >
      {c.label}
    </span>
  );
}

// ── Business health score ─────────────────────────────────────────────────────
function HealthScore({ score }) {
  const color =
    score >= 75 ? "var(--success)" : score >= 50 ? "#fb923c" : "var(--danger)";

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {/* Score circle */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          border: `3px solid ${color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: `${color}15`,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 800,
            fontSize: "22px",
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--muted)",
            letterSpacing: "0.05em",
          }}
        >
          / 100
        </span>
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 700,
            fontSize: "16px",
            marginBottom: "4px",
          }}
        >
          Business Health Score
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          {score >= 75
            ? "Your business is performing well. Keep it up!"
            : score >= 50
              ? "Moderate performance. Some areas need attention."
              : "Action needed — check unpaid invoices and churn."}
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "4px",
            background: "var(--bg3)",
            borderRadius: "2px",
            overflow: "hidden",
            marginTop: "10px",
            width: "200px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${score}%`,
              background: color,
              borderRadius: "2px",
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage({ onBack, vendor }) {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      invoicesAPI.getAnalytics(period),
      invoicesAPI.getInsights(),
      invoicesAPI.getCreditAnalysis(),
    ])
      .then(([analyticsData, insightsData, creditData]) => {
        setData(analyticsData);
        setInsights(insightsData);
        setCredit(creditData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const tabs = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "insights", label: "Insights", icon: Zap },
    { key: "credit", label: "Credit", icon: CreditCard },
    { key: "timing", label: "Peak Times", icon: Clock },
  ];

  return (
    <div style={{ animation: "fadeUp 0.3s ease both" }}>
      {/* Header */}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            Analytics
          </span>
          {vendor && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
                marginLeft: "8px",
              }}
            >
              {vendor.shop_name}
            </span>
          )}
        </div>
      </div>
      {/* Business score badge in header */}
      {insights && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color:
              insights.score >= 75
                ? "var(--success)"
                : insights.score >= 50
                  ? "#fb923c"
                  : "var(--danger)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Activity size={13} />
          Score: {insights.score}/100
        </div>
      )}

      {/* Tab bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          display: "flex",
          gap: "0",
          overflowX: "auto",
          background: "var(--bg)",
        }}
      >
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === key
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              color: activeTab === key ? "var(--text)" : "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

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
            Loading analytics...
          </div>
        )}

        {!loading && data && (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <>
                <div style={{ overflowX: "auto" }}>
                  <PeriodSelector active={period} onChange={setPeriod} />
                </div>

                {/* Stat cards with growth */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <StatCard
                    icon={TrendingUp}
                    label="Revenue"
                    value={fmt(data.summary.total_revenue)}
                    sub={`Paid: ${fmt(data.summary.paid_revenue)}`}
                    color="var(--accent)"
                    growth={data.growth?.revenue_pct}
                  />
                  <StatCard
                    icon={ShoppingBag}
                    label="Invoices"
                    value={data.summary.total_invoices}
                    sub={`Avg: ${fmtFull(data.summary.avg_bill)}`}
                    color="var(--success)"
                    growth={data.growth?.invoices_pct}
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="Unpaid"
                    value={fmt(data.summary.unpaid_revenue)}
                    sub={`${data.unpaid_invoices.length} pending`}
                    color="var(--danger)"
                  />
                </div>

                {/* Revenue chart */}
                {data.revenue_chart.length > 1 && (
                  <Section title="Revenue Over Time" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={data.revenue_chart}
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
                          dataKey="revenue"
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

                {/* Top items + unpaid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <Section title="Top Items" icon={Package}>
                    {data.top_items.length === 0 ? (
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "var(--muted)",
                        }}
                      >
                        No data yet
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {data.top_items.map((item, i) => (
                          <div
                            key={item.name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                color: "var(--muted)",
                                width: "16px",
                                textAlign: "right",
                                flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontSize: "13px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.name}
                              </div>
                              <div
                                style={{
                                  height: "3px",
                                  background: "var(--bg3)",
                                  borderRadius: "2px",
                                  marginTop: "4px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${Math.round((item.qty / data.top_items[0].qty) * 100)}%`,
                                    background: "var(--accent)",
                                    borderRadius: "2px",
                                    transition: "width 0.5s ease",
                                  }}
                                />
                              </div>
                            </div>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                color: "var(--muted)",
                                flexShrink: 0,
                              }}
                            >
                              ×{item.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>

                  <Section title="Unpaid Invoices" icon={AlertCircle}>
                    {data.unpaid_invoices.length === 0 ? (
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "var(--success)",
                        }}
                      >
                        All paid ✓
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {data.unpaid_invoices.map((inv) => (
                          <div
                            key={inv.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontSize: "13px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {inv.buyer_name}
                              </div>
                              <div
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "10px",
                                  color:
                                    inv.days_ago > 7
                                      ? "var(--danger)"
                                      : "var(--muted)",
                                }}
                              >
                                {inv.days_ago === 0
                                  ? "Today"
                                  : `${inv.days_ago}d ago`}
                              </div>
                            </div>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--danger)",
                                flexShrink: 0,
                              }}
                            >
                              {fmt(inv.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>

                {/* Top customers */}
                {data.top_customers.length > 0 && (
                  <Section title="Top Customers" icon={Users}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {data.top_customers.map((c, i) => (
                        <div
                          key={c.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              background:
                                i === 0
                                  ? "rgba(232,255,71,0.15)"
                                  : "var(--bg3)",
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
                                color:
                                  i === 0 ? "var(--accent)" : "var(--muted)",
                                fontWeight: 600,
                              }}
                            >
                              {i + 1}
                            </span>
                          </div>
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
                                {c.name}
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
                                {c.visits} visit{c.visits !== 1 ? "s" : ""}
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
                                  width: `${Math.round((c.total / data.top_customers[0].total) * 100)}%`,
                                  background:
                                    i === 0
                                      ? "var(--accent)"
                                      : "var(--border2)",
                                  borderRadius: "2px",
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-head)",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: i === 0 ? "var(--accent)" : "var(--text)",
                              flexShrink: 0,
                            }}
                          >
                            {fmt(c.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {/* Customer retention */}
                {data.retention && (
                  <Section title="Customer Retention" icon={Users}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {/* New vs Returning bar */}
                      <div style={{ display: "flex", gap: "12px" }}>
                        {[
                          {
                            label: "New",
                            count: data.retention.new_count,
                            color: "var(--accent)",
                            bg: "rgba(232,255,71,0.1)",
                          },
                          {
                            label: "Returning",
                            count: data.retention.returning_count,
                            color: "var(--success)",
                            bg: "rgba(74,222,128,0.1)",
                          },
                        ].map(({ label, count, color, bg }) => (
                          <div
                            key={label}
                            style={{
                              flex: 1,
                              background: bg,
                              borderRadius: "10px",
                              padding: "14px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "var(--font-head)",
                                fontWeight: 800,
                                fontSize: "28px",
                                color,
                                marginBottom: "4px",
                              }}
                            >
                              {count}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                color: "var(--muted)",
                              }}
                            >
                              {label} customer{count !== 1 ? "s" : ""}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* New customers list */}
                      {data.retention.new_customers.length > 0 && (
                        <div>
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
                            New this period
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            {data.retention.new_customers.map((name) => (
                              <span
                                key={name}
                                style={{
                                  background: "rgba(232,255,71,0.1)",
                                  color: "var(--accent)",
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "12px",
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  border: "1px solid rgba(232,255,71,0.2)",
                                }}
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Churned customers */}
                      {data.retention.churned.length > 0 && (
                        <div>
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
                            Haven't visited recently
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            {data.retention.churned.map((c) => (
                              <div
                                key={c.name}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  background: "rgba(248,113,113,0.06)",
                                  border: "1px solid rgba(248,113,113,0.1)",
                                  borderRadius: "8px",
                                  padding: "8px 12px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <UserX size={12} color="var(--danger)" />
                                  <span
                                    style={{
                                      fontFamily: "var(--font-body)",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {c.name}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "11px",
                                    color: "var(--danger)",
                                  }}
                                >
                                  {c.days_ago}d away · {c.visits} visits
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All good state */}
                      {data.retention.churned.length === 0 &&
                        data.retention.new_count === 0 &&
                        data.retention.returning_count === 0 && (
                          <p
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "12px",
                              color: "var(--muted)",
                            }}
                          >
                            No customer data for this period yet.
                          </p>
                        )}
                    </div>
                  </Section>
                )}
              </>
            )}

            {/* ── INSIGHTS TAB ── */}
            {activeTab === "insights" && insights && (
              <>
                <HealthScore score={insights.score} />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {insights.insights.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        color: "var(--muted)",
                      }}
                    >
                      Create more invoices to generate insights
                    </div>
                  ) : (
                    insights.insights.map((insight, i) => {
                      const Icon = INSIGHT_ICONS[insight.icon] || Zap;
                      const colors =
                        INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.info;
                      return (
                        <div
                          key={i}
                          style={{
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            animation: `fadeUp 0.3s ${i * 0.05}s ease both`,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              background: `${colors.text}20`,
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={15} color={colors.text} />
                          </div>
                          <div>
                            <div
                              style={{
                                fontFamily: "var(--font-head)",
                                fontWeight: 600,
                                fontSize: "14px",
                                marginBottom: "3px",
                              }}
                            >
                              {insight.title}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                                color: "var(--muted)",
                                lineHeight: 1.5,
                              }}
                            >
                              {insight.detail}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* ── CREDIT TAB ── */}
            {activeTab === "credit" && credit && (
              <>
                {/* Credit summary */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <StatCard
                    icon={CreditCard}
                    label="Total Credit Out"
                    value={fmt(credit.total_credit_out)}
                    sub="Across all customers"
                    color="var(--danger)"
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="High Risk"
                    value={credit.high_risk_count}
                    sub="Customers overdue 7+ days"
                    color={
                      credit.high_risk_count > 0
                        ? "var(--danger)"
                        : "var(--success)"
                    }
                  />
                </div>

                <Section title="Customer Credit Behavior" icon={CreditCard}>
                  {credit.customers.length === 0 ? (
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      No credit data yet
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {credit.customers.map((c) => (
                        <div
                          key={c.name}
                          style={{
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "10px",
                            padding: "12px 14px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
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
                                }}
                              >
                                {c.name}
                              </span>
                              <RiskBadge risk={c.risk} />
                            </div>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "13px",
                                fontWeight: 600,
                                color:
                                  c.total_unpaid > 0
                                    ? "var(--danger)"
                                    : "var(--success)",
                              }}
                            >
                              {c.total_unpaid > 0
                                ? `-${fmt(c.total_unpaid)}`
                                : "Cleared"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "11px",
                              color: "var(--muted)",
                            }}
                          >
                            <span>Total billed: {fmt(c.total_billed)}</span>
                            <span>{c.invoice_count} invoices</span>
                            {c.avg_delay_days > 0 && (
                              <span
                                style={{
                                  color:
                                    c.avg_delay_days > 7
                                      ? "var(--danger)"
                                      : "var(--muted)",
                                }}
                              >
                                Avg delay: {c.avg_delay_days}d
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>
            )}

            {/* ── PEAK TIMES TAB ── */}
            {activeTab === "timing" && (
              <>
                {data.hourly_chart && data.hourly_chart.length > 0 ? (
                  <>
                    <Section title="Sales by Hour" icon={Clock}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={data.hourly_chart}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
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
                            allowDecimals={false}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "revenue" ? fmt(value) : value,
                              name === "revenue" ? "Revenue" : "Invoices",
                            ]}
                            contentStyle={{
                              background: "var(--bg2)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "12px",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="var(--accent)"
                            radius={[3, 3, 0, 0]}
                            opacity={0.85}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Section>

                    <Section title="Revenue by Hour" icon={TrendingUp}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={data.hourly_chart}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
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
                          <Bar
                            dataKey="revenue"
                            fill="#4ade80"
                            radius={[3, 3, 0, 0]}
                            opacity={0.85}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Section>

                    {/* Peak hour insight */}
                    {data.hourly_chart.length > 0 &&
                      (() => {
                        const peak = data.hourly_chart.reduce((a, b) =>
                          a.count > b.count ? a : b,
                        );
                        return (
                          <div
                            style={{
                              background: "rgba(232,255,71,0.06)",
                              border: "1px solid rgba(232,255,71,0.15)",
                              borderRadius: "12px",
                              padding: "16px 18px",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <Clock size={20} color="var(--accent)" />
                            <div>
                              <div
                                style={{
                                  fontFamily: "var(--font-head)",
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  marginBottom: "3px",
                                }}
                              >
                                Your peak hour is {peak.label}
                              </div>
                              <div
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "12px",
                                  color: "var(--muted)",
                                }}
                              >
                                {peak.count} invoices typically — consider
                                having more staff ready at this time
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "80px 24px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "14px",
                    }}
                  >
                    <Clock
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
                      Not enough data yet
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Create more invoices across different times of day to see
                      your peak sales pattern.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
