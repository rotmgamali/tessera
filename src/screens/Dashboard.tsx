import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileStack,
  ScrollText,
  ShieldCheck,
  Weight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Flag,
  PenLine,
  Boxes,
  FileSearch,
  Loader2,
} from "lucide-react";
import { deadlines, daysUntil } from "../fixtures";
import { Card, SectionHeading, Pill, clusterFlag, healthMeta, fmtTonnes } from "../components/ui";
import { api, type ApiDashboard } from "../lib/api";

type ActivityKind = "extract" | "verify" | "flag" | "sign" | "aggregate" | "audit";

const activityIcon: Record<ActivityKind, typeof CheckCircle2> = {
  extract: FileSearch,
  verify: CheckCircle2,
  flag: Flag,
  sign: PenLine,
  aggregate: Boxes,
  audit: AlertTriangle,
};

const activityTone: Record<ActivityKind, "info" | "success" | "danger" | "gold" | "warning"> = {
  extract: "info",
  verify: "success",
  flag: "danger",
  sign: "gold",
  aggregate: "info",
  audit: "warning",
};

export default function Dashboard() {
  const [data, setData] = useState<ApiDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .dashboard()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e.message ?? e)));
    return () => {
      alive = false;
    };
  }, []);

  const kpis = data?.kpis;
  const kpiTiles = [
    {
      label: "Certificates in-flight",
      value: kpis?.certsInFlight ?? "—",
      sub: `of ${kpis?.totalCerts ?? "—"} in the inbox`,
      icon: FileStack,
      to: "/certificates",
    },
    {
      label: "Pending reviews",
      value: kpis?.pendingReviews ?? "—",
      sub: "needs-review + flagged",
      icon: ScrollText,
      to: "/certificates",
    },
    {
      label: "Verified chain-of-custody",
      value: kpis ? `${kpis.verifiedTonnes} t` : "—",
      sub: "sub-MOQ feedstock, double-count-free",
      icon: Weight,
      to: "/provenance",
    },
    {
      label: "Sites in good standing",
      value: kpis ? `${kpis.sitesHealthy}/${kpis.sitesTotal}` : "—",
      sub: kpis ? `${kpis.sitesWatch} watch · ${kpis.sitesBreach} breach` : "computing…",
      icon: ShieldCheck,
      to: "/ledger",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 border text-bb-caption"
          style={{ background: "var(--bb-error-bg)", borderColor: "rgba(239,68,68,0.35)", color: "var(--bb-danger)" }}
        >
          <AlertTriangle className="w-4 h-4" />
          Could not load the dashboard: {error}
        </div>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiTiles.map((t) => (
          <Link key={t.label} to={t.to} className="bb-luxury-card bb-luxury-card-clickable p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--bb-icon-tile-bg)", boxShadow: "var(--bb-icon-tile-shadow)" }}
              >
                <t.icon className="w-[18px] h-[18px] text-bb-gold" strokeWidth={1.7} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-bb-text-muted" />
            </div>
            <div>
              <div className="text-bb-stat text-bb-text-primary bb-numeric">{t.value}</div>
              <div className="text-bb-caption text-bb-text-secondary mt-0.5">{t.label}</div>
              <div className="text-bb-micro text-bb-text-muted mt-1">{t.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Deadline countdown cards (static regulatory dates — fixtures) */}
      <div>
        <SectionHeading right={<span className="text-bb-micro text-bb-text-muted">In-app date · 20 Jul 2026</span>}>
          Regulatory countdown
        </SectionHeading>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {deadlines.map((d) => {
            const days = daysUntil(d.date);
            const overdue = days < 0;
            const urgent = days >= 0 && days <= 30;
            return (
              <Card key={d.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Pill tone={overdue ? "danger" : urgent ? "warning" : "gold"}>{d.regime}</Pill>
                  <span className="text-bb-micro text-bb-text-muted bb-numeric">
                    {new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div
                  className="text-[1.65rem] font-semibold bb-numeric leading-none mt-1"
                  style={{ color: overdue ? "var(--bb-danger)" : urgent ? "var(--bb-warning)" : "var(--bb-gold)" }}
                >
                  {overdue ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `${days}d`}
                </div>
                <div className="text-bb-caption text-bb-text-secondary leading-snug">{d.label}</div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Per-site mass-balance health strip — computed by the engine */}
        <div className="lg:col-span-2">
          <SectionHeading right={<Link to="/ledger" className="text-bb-caption text-bb-gold hover:underline">Open ledger →</Link>}>
            Mass-balance health per site
          </SectionHeading>
          <div className="flex flex-col gap-3">
            {!data && (
              <div className="bb-luxury-card p-4 text-bb-caption text-bb-text-muted flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Computing per-site balances…
              </div>
            )}
            {data?.sites.map((s) => {
              const hm = healthMeta[s.health];
              const attributedPct = s.poolKg > 0 ? Math.min(100, Math.round((s.attributedKg / s.poolKg) * 100)) : 0;
              const over = s.closingKg < 0;
              return (
                <Card key={s.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{clusterFlag[s.cluster]}</span>
                      <div className="min-w-0">
                        <div className="text-bb-body font-medium text-bb-text-primary truncate">{s.name}</div>
                        <div className="text-bb-micro text-bb-text-muted">{s.isccCertNo} · {s.currentPeriodLabel}</div>
                      </div>
                    </div>
                    <Pill tone={hm.tone}>{hm.label}</Pill>
                  </div>
                  {/* Attribution bar */}
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bb-bg-surface)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${attributedPct}%`, background: hm.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-bb-micro">
                    <span className="text-bb-text-muted bb-numeric">
                      {fmtTonnes(s.attributedKg)} attributed / {fmtTonnes(s.poolKg)} credit pool
                    </span>
                    <span className="bb-numeric" style={{ color: over ? "var(--bb-danger)" : "var(--bb-text-secondary)" }}>
                      {over ? "Over-attributed" : `${100 - attributedPct}% headroom`}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent activity feed */}
        <div>
          <SectionHeading>Recent activity</SectionHeading>
          <Card className="p-0 overflow-hidden">
            <ul className="divide-y" style={{ borderColor: "var(--bb-border)" }}>
              {(data?.activity ?? []).slice(0, 8).map((a) => {
                const kind = a.kind as ActivityKind;
                const Icon = activityIcon[kind] ?? CheckCircle2;
                const tone = activityTone[kind] ?? "info";
                const color: Record<string, string> = {
                  info: "var(--bb-info)",
                  success: "var(--bb-success)",
                  danger: "var(--bb-danger)",
                  gold: "var(--bb-gold)",
                  warning: "var(--bb-warning)",
                };
                return (
                  <li key={a.id} className="flex gap-3 px-4 py-3 bb-actions-row">
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: color[tone] }} />
                    <div className="min-w-0">
                      <p className="text-bb-caption text-bb-text-secondary leading-snug">{a.message}</p>
                      <p className="text-bb-micro text-bb-text-muted mt-1">
                        {a.actor} · {new Date(a.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
