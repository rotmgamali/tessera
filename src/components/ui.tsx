import React from "react";
import type { CertStatus, MassBalanceHealth } from "../fixtures";

// ── Shared primitives in the Web4OS design language ──────────────────

export function Card({
  children,
  className = "",
  as = "div",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "button";
  onClick?: () => void;
}) {
  const Tag = as as any;
  return (
    <Tag
      onClick={onClick}
      className={`bb-luxury-card p-4 text-left w-full ${onClick ? "bb-luxury-card-clickable" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="bb-section-heading text-bb-section uppercase">{children}</h2>
      {right}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const map: Record<string, string> = {
    neutral: "bg-bb-chip border-bb-border text-bb-text-secondary",
    gold: "border text-bb-gold",
    success: "border text-bb-success",
    warning: "border text-bb-warning",
    danger: "border text-bb-danger",
    info: "border text-bb-info",
  };
  const bg: Record<string, React.CSSProperties> = {
    neutral: { background: "var(--bb-chip-bg)", borderColor: "var(--bb-chip-border)" },
    gold: { background: "var(--bb-gold-glow-bg)", borderColor: "var(--bb-border-gold)" },
    success: { background: "var(--bb-success-bg)", borderColor: "var(--bb-border-emerald)" },
    warning: { background: "var(--bb-warning-bg)", borderColor: "var(--bb-border-amber)" },
    danger: { background: "var(--bb-error-bg)", borderColor: "rgba(239,68,68,0.35)" },
    info: { background: "var(--bb-blue-glow)", borderColor: "var(--bb-border-blue)" },
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-bb-micro font-medium ${map[tone]} ${className}`}
      style={bg[tone]}
    >
      {children}
    </span>
  );
}

export function Dot({ tone }: { tone: "success" | "warning" | "danger" | "info" | "gold" }) {
  const c: Record<string, string> = {
    success: "var(--bb-success)",
    warning: "var(--bb-warning)",
    danger: "var(--bb-danger)",
    info: "var(--bb-info)",
    gold: "var(--bb-gold)",
  };
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: c[tone] }} />;
}

export const certStatusMeta: Record<
  CertStatus,
  { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  extracted: { label: "Extracted", tone: "info" },
  "needs-review": { label: "Needs review", tone: "warning" },
  verified: { label: "Verified", tone: "success" },
  flagged: { label: "Flagged", tone: "danger" },
};

export const healthMeta: Record<
  MassBalanceHealth,
  { label: string; tone: "success" | "warning" | "danger"; color: string }
> = {
  healthy: { label: "Healthy", tone: "success", color: "var(--bb-success)" },
  watch: { label: "Watch", tone: "warning", color: "var(--bb-warning)" },
  breach: { label: "Breach", tone: "danger", color: "var(--bb-danger)" },
};

export const clusterFlag: Record<string, string> = {
  italy: "🇮🇹",
  china: "🇨🇳",
  vietnam: "🇻🇳",
};

export function fmtKg(kg: number): string {
  return `${kg.toLocaleString("en-US")} kg`;
}

export function fmtTonnes(kg: number): string {
  return `${(kg / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} t`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = new Date("2026-07-20T10:00:00Z").getTime();
  const mins = Math.round((now - then) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
