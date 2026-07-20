import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Link2,
  Scale,
  TrendingDown,
} from "lucide-react";
import {
  sites,
  siteById,
  ledgerForSite,
  periods,
  type LedgerEntry,
} from "../fixtures";
import { Pill, healthMeta, fmtKg, clusterFlag } from "../components/ui";

export default function Ledger() {
  const [siteId, setSiteId] = useState(sites[0].id);
  const [period, setPeriod] = useState(periods[0]);
  const [auditor, setAuditor] = useState(false);

  const site = siteById(siteId)!;
  const entries = ledgerForSite(siteId, period);
  const hm = healthMeta[site.health];

  const inputs = entries.filter((e) => e.type === "input");
  const outputs = entries.filter((e) => e.type === "output");
  const totalIn = inputs.reduce((s, e) => s + e.quantityKg, 0);
  const totalOut = outputs.reduce((s, e) => s + e.quantityKg, 0);
  const closing = entries.length ? entries[entries.length - 1].runningBalanceKg : 0;
  const warnings = entries.filter((e) => e.doubleCountRisk && e.doubleCountRisk !== "none");

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-bb-micro text-bb-text-muted uppercase tracking-wide">Site</span>
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="bb-luxury-input px-3 py-1.5 text-bb-caption text-bb-text-primary"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {clusterFlag[s.cluster]} {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-bb-micro text-bb-text-muted uppercase tracking-wide">Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bb-luxury-input px-3 py-1.5 text-bb-caption text-bb-text-primary"
          >
            {periods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {/* Auditor view toggle */}
        <button
          onClick={() => setAuditor((v) => !v)}
          className={`bb-filter-chip ${auditor ? "bb-filter-chip-active" : ""}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Auditor view {auditor ? "on" : "off"}
        </button>
      </div>

      {auditor && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 border text-bb-caption"
          style={{ background: "var(--bb-blue-glow)", borderColor: "var(--bb-border-blue)", color: "var(--bb-info)" }}
        >
          <Lock className="w-4 h-4" />
          Read-only auditor presentation — every figure links to source evidence; ISCC PLUS 203-2 continuity, conversion factors and double-counting controls are shown explicitly.
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile icon={ArrowDownRight} label="Certified feedstock in" value={fmtKg(totalIn)} tone="success" />
        <SummaryTile icon={ArrowUpRight} label="Attributed to output" value={fmtKg(totalOut)} tone="info" />
        <SummaryTile icon={Scale} label="Closing balance" value={fmtKg(closing)} tone={closing < 0 ? "danger" : "gold"} />
        <SummaryTile icon={TrendingDown} label="Conversion factor" value={site.conversionFactor.toFixed(2)} tone="neutral" sub="consumption/yield" />
      </div>

      {/* Breach / warning banner */}
      {site.health !== "healthy" && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 border"
          style={{
            background: site.health === "breach" ? "var(--bb-error-bg)" : "var(--bb-warning-bg)",
            borderColor: site.health === "breach" ? "rgba(239,68,68,0.35)" : "var(--bb-border-amber)",
          }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: hm.color }} />
          <div>
            <div className="text-bb-body font-medium" style={{ color: hm.color }}>
              {site.health === "breach"
                ? "Mass-balance breach — over-attribution detected"
                : "Watch — a staged input is held out of attribution"}
            </div>
            <div className="text-bb-caption text-bb-text-secondary mt-0.5">
              {site.health === "breach"
                ? "Attributed output exceeds certified input for this continuous period (negative closing balance). Under ISCC PLUS 203-2 this is a reportable breach — correct before assembling any substantiation pack."
                : "A GRS-standard input cannot be booked into an ISCC PLUS mass balance without creating a double-counting risk. It is staged and blocked from attribution pending a reviewer determination."}
            </div>
          </div>
        </div>
      )}

      {/* Ledger table */}
      <div className="bb-luxury-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--bb-border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-bb-body font-medium text-bb-text-primary">{site.name}</span>
            <Pill tone={hm.tone}>{hm.label}</Pill>
          </div>
          <span className="text-bb-micro text-bb-text-muted">{site.iscCertNo} · {period}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-bb-caption" style={{ minWidth: 720 }}>
            <thead>
              <tr className="text-bb-micro text-bb-text-muted uppercase tracking-wide" style={{ background: "rgba(255,255,255,0.02)" }}>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-left font-medium px-4 py-2.5">Movement</th>
                <th className="text-left font-medium px-4 py-2.5">Evidence</th>
                <th className="text-right font-medium px-4 py-2.5">Qty (kg)</th>
                <th className="text-right font-medium px-4 py-2.5">Factor</th>
                <th className="text-right font-medium px-4 py-2.5">Running bal.</th>
                <th className="text-center font-medium px-4 py-2.5">Control</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <LedgerRow key={e.id} e={e} auditor={auditor} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t" style={{ borderColor: "var(--bb-border)", background: "rgba(255,255,255,0.02)" }}>
                <td className="px-4 py-3 text-bb-caption font-medium text-bb-text-secondary" colSpan={5}>
                  Closing certified credit balance
                </td>
                <td className="px-4 py-3 text-right bb-numeric font-semibold" style={{ color: closing < 0 ? "var(--bb-danger)" : "var(--bb-gold)" }}>
                  {closing.toLocaleString("en-US")}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Double-counting prevention panel */}
      <div>
        <div className="text-bb-section uppercase bb-section-heading mb-3">Double-counting prevention log</div>
        {warnings.length === 0 ? (
          <div className="bb-luxury-card p-4 text-bb-caption text-bb-text-secondary flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-bb-success" /> No double-counting risks flagged for this period. All inputs are single-standard, single-site, single-period.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {warnings.map((w) => (
              <div
                key={w.id}
                className="bb-luxury-card p-3 flex items-start gap-3"
                style={{ borderColor: w.doubleCountRisk === "blocked" ? "rgba(239,68,68,0.35)" : "var(--bb-border-amber)" }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: w.doubleCountRisk === "blocked" ? "var(--bb-danger)" : "var(--bb-warning)" }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-bb-caption font-medium text-bb-text-primary">{w.evidenceRef}</span>
                    <Pill tone={w.doubleCountRisk === "blocked" ? "danger" : "warning"}>
                      {w.doubleCountRisk === "blocked" ? "Blocked" : "Held for review"}
                    </Pill>
                  </div>
                  <div className="text-bb-caption text-bb-text-secondary mt-0.5">{w.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
  tone: "success" | "info" | "gold" | "danger" | "neutral";
  sub?: string;
}) {
  const color: Record<string, string> = {
    success: "var(--bb-success)",
    info: "var(--bb-info)",
    gold: "var(--bb-gold)",
    danger: "var(--bb-danger)",
    neutral: "var(--bb-text-primary)",
  };
  return (
    <div className="bb-luxury-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: color[tone] }} />
        <span className="text-bb-micro text-bb-text-muted uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-bb-stat bb-numeric" style={{ color: color[tone] }}>{value}</div>
      {sub && <div className="text-bb-micro text-bb-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function LedgerRow({ e, auditor }: { e: LedgerEntry; auditor: boolean }) {
  const isInput = e.type === "input";
  const risk = e.doubleCountRisk && e.doubleCountRisk !== "none";
  return (
    <tr
      className="border-t"
      style={{
        borderColor: "var(--bb-border)",
        background: risk ? (e.doubleCountRisk === "blocked" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.05)") : undefined,
      }}
    >
      <td className="px-4 py-3 text-bb-text-muted bb-numeric whitespace-nowrap">
        {new Date(e.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {isInput ? (
            <ArrowDownRight className="w-3.5 h-3.5" style={{ color: "var(--bb-success)" }} />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "var(--bb-info)" }} />
          )}
          <span className="text-bb-text-primary">{e.description}</span>
        </div>
        {auditor && e.note && (
          <div className="text-bb-micro text-bb-text-muted mt-1 pl-6">{e.note}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-bb-gold bb-numeric">
          {auditor && <Link2 className="w-3 h-3" />}
          {e.evidenceRef}
        </span>
      </td>
      <td className="px-4 py-3 text-right bb-numeric" style={{ color: isInput ? "var(--bb-success)" : "var(--bb-info)" }}>
        {isInput ? "+" : "−"}{e.quantityKg.toLocaleString("en-US")}
      </td>
      <td className="px-4 py-3 text-right bb-numeric text-bb-text-muted">
        {e.conversionFactor ? e.conversionFactor.toFixed(2) : "—"}
      </td>
      <td className="px-4 py-3 text-right bb-numeric font-medium" style={{ color: e.runningBalanceKg < 0 ? "var(--bb-danger)" : "var(--bb-text-primary)" }}>
        {e.runningBalanceKg.toLocaleString("en-US")}
      </td>
      <td className="px-4 py-3 text-center">
        {risk ? (
          <AlertTriangle className="w-4 h-4 inline" style={{ color: e.doubleCountRisk === "blocked" ? "var(--bb-danger)" : "var(--bb-warning)" }} />
        ) : (
          <span className="text-bb-success text-bb-micro">✓</span>
        )}
      </td>
    </tr>
  );
}
