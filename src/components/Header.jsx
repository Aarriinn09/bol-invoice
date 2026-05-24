import React, { useState } from "react";
import {
  PlusCircle,
  History,
  LogOut,
  BarChart2,
  Receipt,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import VendorProfile from "./VendorProfile";

export default function Header({
  hasActiveOrder,
  onNewOrder,
  onShowHistory,
  onShowAnalytics,
  onShowGST,
}) {
  const { vendor, logout, login } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  function handleProfileUpdate(updatedVendor) {
    // Update auth context with new vendor data
    const token = localStorage.getItem("bol_token");
    login(token, updatedVendor);
  }

  return (
    <>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: "58px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "-0.5px",
            }}
          >
            BOL
          </span>
          {vendor && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted)",
              }}
            >
              {vendor.shop_name}
            </span>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {hasActiveOrder && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--success)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  display: "inline-block",
                  animation: "pulse-ring 2s infinite",
                }}
              />
              Order active
            </div>
          )}

          {hasActiveOrder && (
            <button
              onClick={onNewOrder}
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
                padding: "6px 12px",
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
              <PlusCircle size={13} /> New Order
            </button>
          )}

          {[
            {
              icon: History,
              label: "History",
              onClick: onShowHistory,
              show: true,
            },
            {
              icon: BarChart2,
              label: "Analytics",
              onClick: onShowAnalytics,
              show: true,
            },
            {
              icon: Receipt,
              label: "GST",
              onClick: onShowGST,
              show: !!vendor?.gstin,
            },
          ]
            .filter((b) => b.show)
            .map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted)")
                }
              >
                <Icon size={13} /> {label}
              </button>
            ))}

          {/* Profile / Settings */}
          <button
            onClick={() => setShowProfile(true)}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "var(--radius)",
              transition: "color 0.15s",
            }}
            title="Shop profile"
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <Settings size={15} />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "var(--radius)",
              transition: "color 0.15s",
            }}
            title="Logout"
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--danger)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Profile modal */}
      {showProfile && (
        <VendorProfile
          vendor={vendor}
          onClose={() => setShowProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}
