import React from "react";

function SkeletonBox({
  width = "100%",
  height = "16px",
  radius = "var(--radius)",
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <SkeletonBox width="40%" height="14px" />
        <SkeletonBox width="20%" height="14px" />
      </div>
      <SkeletonBox width="60%" height="12px" />
      <SkeletonBox width="100%" height="3px" radius="2px" />
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "18px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <SkeletonBox width="50%" height="11px" />
      <SkeletonBox width="60%" height="26px" />
      <SkeletonBox width="40%" height="11px" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <SkeletonStat />
      <SkeletonStat />
      <SkeletonStat />
    </div>
  );
}

export default SkeletonBox;
