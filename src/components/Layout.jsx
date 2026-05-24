import React, { useState } from "react";
import {
  FileText,
  History,
  BarChart2,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import VendorProfile from "./VendorProfile";

const NAV_ITEMS = [
  { key: "main", icon: FileText, label: "Invoice" },
  { key: "history", icon: History, label: "History" },
  { key: "analytics", icon: BarChart2, label: "Analytics" },
  { key: "gst", icon: Receipt, label: "GST", requiresGSTIN: true },
];

export default function Layout({
  page,
  onNavigate,
  children,
  hasActiveOrder,
  vendor,
}) {
  const { logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const navItems = NAV_ITEMS.filter(
    (item) => !item.requiresGSTIN || !!vendor?.gstin,
  );

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* ── Top header ── */}
      <header
        style={{
          height: "58px",
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => onNavigate("main")}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "-1px",
            }}
          >
            BOL
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--muted)",
              letterSpacing: "0.08em",
            }}
            className="desktop-only"
          >
            INVOICE
          </span>
        </div>

        {/* Desktop center nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          className="desktop-nav"
        >
          {navItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "7px 14px",
                background: page === key ? "rgba(232,255,71,0.1)" : "none",
                border:
                  page === key
                    ? "1px solid rgba(232,255,71,0.2)"
                    : "1px solid transparent",
                borderRadius: "var(--radius)",
                color: page === key ? "var(--accent)" : "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (page !== key) {
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.background = "var(--bg3)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== key) {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.background = "none";
                }
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {/* Active order pill */}
          {hasActiveOrder && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--success)",
                padding: "4px 10px",
                background: "rgba(74,222,128,0.08)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(74,222,128,0.15)",
                cursor: "pointer",
              }}
              onClick={() => onNavigate("main")}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  flexShrink: 0,
                  animation: "pulse-ring 2s infinite",
                }}
              />
              <span className="desktop-only">Active order</span>
            </div>
          )}

          {/* Settings icon */}
          <button
            onClick={() => setShowProfile(true)}
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            title="Shop settings"
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <Settings size={14} color="var(--muted)" />
          </button>

          {/* Logout icon */}
          <button
            onClick={logout}
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            title="Logout"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <LogOut size={14} color="var(--muted)" />
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px 16px 80px",
        }}
      >
        {children}
      </div>

      {/* ── Mobile bottom nav ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "64px",
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
          zIndex: 100,
        }}
        className="mobile-nav"
      >
        {navItems.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              padding: "8px 4px",
              background: "none",
              border: "none",
              color: page === key ? "var(--accent)" : "var(--muted)",
              cursor: "pointer",
              transition: "color 0.15s",
              position: "relative",
            }}
          >
            {page === key && (
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
            )}
            <Icon size={20} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </span>
          </button>
        ))}

        <button
          onClick={() => setShowProfile(true)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            padding: "8px 4px",
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          <Settings size={20} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.04em",
            }}
          >
            Settings
          </span>
        </button>
      </div>

      {/* Profile modal */}
      {showProfile && (
        <VendorProfile
          vendor={vendor}
          onClose={() => setShowProfile(false)}
          onUpdate={() => setShowProfile(false)}
        />
      )}

      <style>{`
        @media (min-width: 641px) {
          .mobile-nav  { display: none !important; }
          .desktop-nav { display: flex !important; }
          .desktop-only { display: inline !important; }
        }
        @media (max-width: 640px) {
          .mobile-nav  { display: flex !important; }
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
