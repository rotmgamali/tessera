import { useState } from "react";
import {
  FileCheck2,
  Download,
  Database,
  PenLine,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  packs,
  siteById,
  type SubstantiationPack,
  type PackStage,
} from "../fixtures";
import { Pill, clusterFlag } from "../components/ui";

const stageMeta: Record<PackStage, { label: string; tone: "neutral" | "warning" | "success" }> = {
  draft: { label: "Draft", tone: "neutral" },
  "in-review": { label: "In review", tone: "warning" },
  signed: { label: "Signed", tone: "success" },
};

const stageOrder: PackStage[] = ["draft", "in-review", "signed"];

export default function Substantiation() {
  const [id, setId] = useState(packs.find((p) => p.stage === "signed")?.id ?? packs[0].id);
  const pack = packs.find((p) => p.id === id)!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Pack list */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        <div className="bb-section-heading text-bb-section uppercase">Substantiation packs</div>
        {packs.map((p) => {
          const site = siteById(p.siteId);
          const sm = stageMeta[p.stage];
          return (
            <button
              key={p.id}
              onClick={() => setId(p.id)}
              className={`bb-luxury-card bb-luxury-card-clickable p-4 text-left ${p.id === id ? "bb-gold-aura" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-bb-caption font-semibold text-bb-text-primary bb-numeric">{p.ref}</span>
                <Pill tone={sm.tone}>{sm.label}</Pill>
              </div>
              <div className="text-bb-caption text-bb-text-secondary leading-snug">{p.title}</div>
              <div className="flex items-center gap-2 mt-2 text-bb-micro text-bb-text-muted">
                <span>{clusterFlag[site?.cluster ?? "italy"]} {p.period}</span>
                <span>·</span>
                <span className="bb-numeric">{p.evidenceTonnes} t evidence</span>
              </div>
              <div className="flex gap-1 mt-2">
                {p.targetRegime.map((r) => (
                  <span key={r} className="text-bb-micro px-1.5 py-0.5 rounded" style={{ background: "var(--bb-chip-bg)", color: "var(--bb-text-secondary)" }}>{r}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pack detail / builder */}
      <div className="lg:col-span-3">
        <PackDetail pack={pack} />
      </div>
    </div>
  );
}

function PackDetail({ pack }: { pack: SubstantiationPack }) {
  const site = siteById(pack.siteId);
  const canDownload = pack.stage === "signed";
  const canExportDpp = pack.stage === "signed" && pack.targetRegime.includes("DPP");

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bb-luxury-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--bb-icon-tile-bg)", boxShadow: "var(--bb-icon-tile-shadow)" }}>
              <FileCheck2 className="w-5 h-5 text-bb-gold" />
            </div>
            <div>
              <div className="text-bb-heading font-semibold text-bb-text-primary">{pack.title}</div>
              <div className="text-bb-caption text-bb-text-muted">{pack.ref} · {clusterFlag[site?.cluster ?? "italy"]} {site?.name} · {pack.period}</div>
            </div>
          </div>
        </div>

        {/* Claim */}
        <div className="mt-4 rounded-lg p-3 border" style={{ background: "var(--bb-gold-glow-bg)", borderColor: "var(--bb-border-gold)" }}>
          <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide mb-1">Claim being substantiated</div>
          <div className="text-bb-body text-bb-text-primary">"{pack.claim}"</div>
        </div>
      </div>

      {/* Sign-off stepper */}
      <div className="bb-luxury-card p-5">
        <div className="text-bb-section uppercase bb-section-heading mb-4">Human-in-the-loop sign-off</div>
        <div className="flex items-center">
          {stageOrder.map((s, i) => {
            const reached = stageOrder.indexOf(pack.stage) >= i;
            const current = pack.stage === s;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border"
                    style={{
                      background: reached ? "var(--bb-gold-glow-bg)" : "transparent",
                      borderColor: reached ? "var(--bb-gold)" : "var(--bb-border)",
                    }}
                  >
                    {reached ? <CheckCircle2 className="w-4 h-4 text-bb-gold" /> : <Circle className="w-4 h-4 text-bb-text-muted" />}
                  </div>
                  <span className="text-bb-micro" style={{ color: current ? "var(--bb-gold)" : reached ? "var(--bb-text-secondary)" : "var(--bb-text-muted)" }}>
                    {stageMeta[s].label}
                  </span>
                </div>
                {i < stageOrder.length - 1 && (
                  <div className="flex-1 h-px mx-2" style={{ background: stageOrder.indexOf(pack.stage) > i ? "var(--bb-gold)" : "var(--bb-border)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Reviewer / signature block */}
        <div className="mt-5 rounded-lg p-4" style={{ background: "var(--bb-bg-surface)" }}>
          {pack.stage === "signed" ? (
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--bb-success)" }} />
              <div>
                <div className="text-bb-body text-bb-text-primary flex items-center gap-2">
                  Signed by <span className="font-semibold">{pack.reviewer}</span>
                  <PenLine className="w-3.5 h-3.5 text-bb-gold" />
                </div>
                <div className="text-bb-caption text-bb-text-secondary">{pack.reviewerTitle}</div>
                <div className="text-bb-micro text-bb-text-muted mt-0.5 bb-numeric">
                  {pack.signedAt && new Date(pack.signedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ) : pack.stage === "in-review" ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--bb-warning)" }} />
              <div>
                <div className="text-bb-body text-bb-text-primary">Awaiting sign-off — <span className="font-medium">{pack.reviewer}</span></div>
                <div className="text-bb-caption text-bb-text-secondary">{pack.reviewerTitle}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--bb-text-muted)" }} />
              <div className="text-bb-caption text-bb-text-secondary">Not yet ready for review.</div>
            </div>
          )}
        </div>

        {/* Liability language */}
        <div className="mt-3 rounded-lg p-3 border" style={{ borderColor: "var(--bb-border)" }}>
          <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> Liability
          </div>
          <p className="text-bb-caption text-bb-text-secondary leading-relaxed">{pack.liabilityNote}</p>
        </div>
      </div>

      {/* Pack contents */}
      <div className="bb-luxury-card p-5">
        <div className="text-bb-section uppercase bb-section-heading mb-3">Pack contents</div>
        <ul className="flex flex-col gap-1.5">
          {pack.contents.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-bb-caption">
              {c.included ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--bb-success)" }} />
              ) : (
                <Circle className="w-4 h-4 shrink-0" style={{ color: "var(--bb-text-muted)" }} />
              )}
              <span className={c.included ? "text-bb-text-primary" : "text-bb-text-muted line-through"}>{c.label}</span>
              <span className="bb-numeric text-bb-text-muted ml-auto">×{c.count}</span>
            </li>
          ))}
        </ul>

        {/* Export actions */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            className="bb-event-action bb-event-action-primary"
            disabled={!canDownload}
            onClick={() => alert("Demo: audit-ready pack PDF export is stubbed in Wave 1.")}
          >
            <Download className="w-4 h-4" /> Download pack
          </button>
          <button
            className="bb-event-action bb-event-action-secondary"
            disabled={!canExportDpp}
            onClick={() => alert("Demo: DPP feedstock-provenance JSON export is stubbed in Wave 1.")}
          >
            <Database className="w-4 h-4" /> Export DPP data
          </button>
          {!canDownload && (
            <span className="text-bb-micro text-bb-text-muted self-center">Pack must be signed before it can be exported.</span>
          )}
        </div>
      </div>
    </div>
  );
}
