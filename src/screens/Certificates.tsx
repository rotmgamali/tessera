import { useState } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  certificates,
  certCounts,
  siteById,
  type Certificate,
  type CertStatus,
  type ExtractedField,
} from "../fixtures";
import { Card, Pill, certStatusMeta, clusterFlag, fmtKg } from "../components/ui";

type Filter = "all" | CertStatus;

const filters: { key: Filter; label: string; count: number }[] = [
  { key: "all", label: "All", count: certificates.length },
  { key: "needs-review", label: "Needs review", count: certCounts.needsReview },
  { key: "flagged", label: "Flagged", count: certCounts.flagged },
  { key: "extracted", label: "Extracted", count: certCounts.extracted },
  { key: "verified", label: "Verified", count: certCounts.verified },
];

const fieldTone: Record<ExtractedField["status"], { color: string; label: string }> = {
  match: { color: "var(--bb-success)", label: "Match" },
  mismatch: { color: "var(--bb-danger)", label: "Mismatch" },
  gap: { color: "var(--bb-warning)", label: "Gap" },
};

export default function Certificates() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string>(
    certificates.find((c) => c.status === "needs-review")?.id ?? certificates[0].id,
  );

  const visible =
    filter === "all" ? certificates : certificates.filter((c) => c.status === filter);
  const selected = certificates.find((c) => c.id === selectedId) ?? visible[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`bb-filter-chip ${filter === f.key ? "bb-filter-chip-active" : ""}`}
          >
            {f.label}
            <span className="bb-numeric opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Queue */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          {visible.map((c) => (
            <QueueRow
              key={c.id}
              cert={c}
              active={c.id === selected?.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>

        {/* Detail — side-by-side source + extracted fields */}
        <div className="lg:col-span-3">
          {selected && <CertDetail cert={selected} />}
        </div>
      </div>
    </div>
  );
}

function QueueRow({ cert, active, onClick }: { cert: Certificate; active: boolean; onClick: () => void }) {
  const meta = certStatusMeta[cert.status];
  const site = siteById(cert.destinationSiteId);
  return (
    <button
      onClick={onClick}
      className={`bb-luxury-card bb-luxury-card-clickable p-3 text-left ${active ? "bb-gold-aura" : ""}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-bb-caption font-semibold text-bb-text-primary bb-numeric">{cert.ref}</span>
        <Pill tone={meta.tone}>{meta.label}</Pill>
      </div>
      <div className="text-bb-caption text-bb-text-secondary truncate">{cert.supplierName}</div>
      <div className="flex items-center justify-between mt-1.5 text-bb-micro text-bb-text-muted">
        <span className="truncate">{cert.docType} · {cert.material.split("—")[1]?.trim() ?? cert.material}</span>
        <span className="bb-numeric shrink-0 ml-2">{fmtKg(cert.netWeightKg)}</span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-bb-micro text-bb-text-muted">
        <span>{clusterFlag[site?.cluster ?? "italy"]} {site?.name.split("—")[1]?.trim()}</span>
        {cert.flagCount > 0 && (
          <span className="flex items-center gap-1" style={{ color: "var(--bb-warning)" }}>
            <AlertTriangle className="w-3 h-3" /> {cert.flagCount} flag{cert.flagCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </button>
  );
}

function CertDetail({ cert }: { cert: Certificate }) {
  const site = siteById(cert.destinationSiteId);
  const meta = certStatusMeta[cert.status];
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-bb-heading font-semibold text-bb-text-primary bb-numeric">{cert.ref}</span>
              <Pill tone={meta.tone}>{meta.label}</Pill>
            </div>
            <div className="text-bb-caption text-bb-text-secondary">{cert.supplierName} → {site?.name}</div>
            <div className="text-bb-micro text-bb-text-muted mt-0.5">{cert.docType} · {cert.standard}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide">Extraction confidence</div>
            <div className="text-bb-stat bb-numeric" style={{ color: cert.extractionConfidence > 0.85 ? "var(--bb-success)" : "var(--bb-warning)" }}>
              {Math.round(cert.extractionConfidence * 100)}%
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Source PDF preview (styled placeholder) */}
        <div>
          <div className="text-bb-micro text-bb-text-muted uppercase tracking-wider mb-2">Source document</div>
          <div className="bb-luxury-card p-0 overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
            <div className="h-8 flex items-center gap-2 px-3 border-b" style={{ borderColor: "var(--bb-border)", background: "rgba(0,0,0,0.25)" }}>
              <FileText className="w-3.5 h-3.5 text-bb-text-muted" />
              <span className="text-bb-micro text-bb-text-muted bb-numeric">{cert.ref}.pdf</span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="text-center">
                <div className="text-bb-caption font-semibold text-bb-text-secondary uppercase tracking-wider">{cert.standard}</div>
                <div className="text-bb-micro text-bb-text-muted">{cert.docType}</div>
              </div>
              <div className="h-px" style={{ background: "var(--bb-border)" }} />
              {/* fake scanned lines */}
              <div className="flex flex-col gap-2 opacity-70">
                {[92, 78, 85, 60, 88, 72, 95, 55, 80, 66].map((w, i) => (
                  <div key={i} className="h-2 rounded-sm skeleton-shimmer" style={{ width: `${w}%`, animation: "none", background: "var(--bb-bg-surface)" }} />
                ))}
              </div>
              <div className="h-px" style={{ background: "var(--bb-border)" }} />
              <div className="flex items-center justify-between text-bb-micro text-bb-text-muted">
                <span>Net wt.</span><span className="bb-numeric">{fmtKg(cert.netWeightKg)}</span>
              </div>
              <div className="flex items-center justify-between text-bb-micro text-bb-text-muted">
                <span>Recycled</span><span className="bb-numeric">{cert.recycledContentPct}%</span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-bb-micro text-bb-text-muted">
                <Sparkles className="w-3 h-3 text-bb-gold" /> AI-extracted from scanned PDF (demo placeholder)
              </div>
            </div>
          </div>
        </div>

        {/* Extracted normalized ISCC fields */}
        <div>
          <div className="text-bb-micro text-bb-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3 text-bb-gold" /> Normalized ISCC fields
          </div>
          <div className="bb-luxury-card p-0 overflow-hidden">
            <ul className="divide-y" style={{ borderColor: "var(--bb-border)" }}>
              {cert.fields.map((f, i) => {
                const ft = fieldTone[f.status];
                return (
                  <li key={i} className="px-3 py-2.5" style={f.status !== "match" ? { background: "rgba(245,158,11,0.05)" } : undefined}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-bb-micro text-bb-text-muted">{f.label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {f.status === "match" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: ft.color }} />
                        ) : f.status === "gap" ? (
                          <CircleDashed className="w-3.5 h-3.5" style={{ color: ft.color }} />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" style={{ color: ft.color }} />
                        )}
                        <span className="text-bb-micro bb-numeric" style={{ color: "var(--bb-text-muted)" }}>
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-bb-caption text-bb-text-primary mt-0.5">{f.value}</div>
                    {f.note && (
                      <div className="text-bb-micro mt-1 flex items-start gap-1" style={{ color: ft.color }}>
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {f.note}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button className="bb-event-action bb-event-action-primary flex-1 justify-center" onClick={() => alert("Demo: verify & book to mass balance is stubbed in Wave 1.")}>
              <CheckCircle2 className="w-4 h-4" /> Verify & book
            </button>
            <button className="bb-event-action bb-event-action-secondary" onClick={() => alert("Demo: request supplier correction is stubbed in Wave 1.")}>
              Request correction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
