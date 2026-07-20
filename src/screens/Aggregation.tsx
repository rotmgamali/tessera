import { useState } from "react";
import {
  Boxes,
  Container,
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  offcuts,
  lots,
  offcutById,
  type SubMoqOffcut,
  type CertifiedLot,
} from "../fixtures";
import { Pill, clusterFlag, fmtKg } from "../components/ui";

const statusMeta: Record<SubMoqOffcut["status"], { tone: "success" | "warning" | "danger"; label: string; icon: typeof CheckCircle2 }> = {
  verified: { tone: "success", label: "Verified", icon: CheckCircle2 },
  pending: { tone: "warning", label: "Pending", icon: CircleDashed },
  flagged: { tone: "danger", label: "Flagged", icon: AlertTriangle },
};

export default function Aggregation() {
  const [lotId, setLotId] = useState(lots[0].id);
  const lot = lots.find((l) => l.id === lotId)!;
  const memberIds = new Set(lot.offcutIds);
  const members = lot.offcutIds.map((id) => offcutById(id)!).filter(Boolean);
  const candidates = offcuts.filter((o) => !memberIds.has(o.id));

  return (
    <div className="flex flex-col gap-5">
      {/* Lot selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lots.map((l) => (
          <LotCard key={l.id} lot={l} active={l.id === lotId} onClick={() => setLotId(l.id)} />
        ))}
      </div>

      {/* Mosaic — fragments on the left, target lot on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Available sub-MOQ offcuts */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Boxes className="w-4 h-4 text-bb-gold" />
            <span className="bb-section-heading text-bb-section uppercase">Sub-MOQ offcut fragments</span>
            <span className="text-bb-micro text-bb-text-muted">— match to {lot.ref}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {candidates.map((o) => (
              <OffcutTile key={o.id} o={o} inLot={false} />
            ))}
          </div>
          <p className="text-bb-micro text-bb-text-muted mt-3 leading-relaxed">
            Each tile is one small supplier's offcut volume — individually below any recycler's minimum order quantity.
            Tessera stitches verified fragments into a certified container-scale lot without ever taking title to material.
          </p>
        </div>

        {/* Target lot */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Container className="w-4 h-4 text-bb-gold" />
            <span className="bb-section-heading text-bb-section uppercase">Certified lot — {lot.ref}</span>
          </div>
          <div className="bb-luxury-card p-4 flex flex-col gap-4">
            {/* Spec */}
            <div>
              <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Recycler spec — {lot.buyerName}
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-bb-caption">
                <SpecRow label="Grade" value={lot.specGrade} />
                <SpecRow label="Color family" value={lot.specColor} />
                <SpecRow label="Composition" value={lot.specComposition} />
                <SpecRow label="MOQ" value={fmtKg(lot.moqKg)} />
              </div>
            </div>

            <div className="h-px" style={{ background: "var(--bb-border)" }} />

            {/* Fill gauge */}
            <FillGauge lot={lot} />

            <div className="h-px" style={{ background: "var(--bb-border)" }} />

            {/* Members */}
            <div>
              <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide mb-2">
                Stitched fragments ({members.length})
              </div>
              <div className="flex flex-col gap-2">
                {members.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 text-bb-caption">
                    <span>{clusterFlag[o.cluster]}</span>
                    <span className="text-bb-text-primary truncate flex-1">{o.supplierName}</span>
                    <span className="bb-numeric text-bb-text-muted">{fmtKg(o.volumeKg)}</span>
                    <span className="bb-numeric" style={{ color: "var(--bb-success)" }}>{Math.round(o.matchScore * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LotCard({ lot, active, onClick }: { lot: CertifiedLot; active: boolean; onClick: () => void }) {
  const pct = Math.min(100, Math.round((lot.filledKg / lot.moqKg) * 100));
  const ready = lot.filledKg >= lot.moqKg;
  return (
    <button
      onClick={onClick}
      className={`bb-luxury-card bb-luxury-card-clickable p-4 text-left ${active ? "bb-gold-aura" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-bb-body font-semibold text-bb-text-primary bb-numeric">{lot.ref}</span>
        <Pill tone={ready ? "success" : "gold"}>{ready ? "MOQ met" : "Filling"}</Pill>
      </div>
      <div className="text-bb-caption text-bb-text-secondary flex items-center gap-1.5 mb-3">
        {lot.specGrade} · {lot.specColor}
        <ArrowRight className="w-3 h-3 text-bb-text-muted" />
        {lot.buyerName}
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bb-bg-surface)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ready ? "var(--bb-success)" : "linear-gradient(90deg, var(--bb-gold-dim), var(--bb-gold))" }} />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-bb-micro">
        <span className="bb-numeric text-bb-text-muted">{fmtKg(lot.filledKg)} / {fmtKg(lot.moqKg)}</span>
        <span className="bb-numeric font-medium" style={{ color: ready ? "var(--bb-success)" : "var(--bb-gold)" }}>{pct}%</span>
      </div>
    </button>
  );
}

function FillGauge({ lot }: { lot: CertifiedLot }) {
  const pct = Math.min(100, Math.round((lot.filledKg / lot.moqKg) * 100));
  const ready = lot.filledKg >= lot.moqKg;
  const remaining = Math.max(0, lot.moqKg - lot.filledKg);
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-bb-stat bb-numeric" style={{ color: ready ? "var(--bb-success)" : "var(--bb-gold)" }}>{pct}%</div>
          <div className="text-bb-micro text-bb-text-muted">of MOQ threshold</div>
        </div>
        <div className="text-right">
          <div className="text-bb-caption bb-numeric text-bb-text-primary">{fmtKg(lot.filledKg)}</div>
          <div className="text-bb-micro text-bb-text-muted">of {fmtKg(lot.moqKg)}</div>
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden relative" style={{ background: "var(--bb-bg-surface)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ready ? "var(--bb-success)" : "linear-gradient(90deg, var(--bb-gold-dim), var(--bb-gold))" }} />
      </div>
      <div className="text-bb-micro mt-2" style={{ color: ready ? "var(--bb-success)" : "var(--bb-text-secondary)" }}>
        {ready ? "Threshold met — lot spec-locked and ready for a transaction certificate." : `${fmtKg(remaining)} more verified offcut needed to reach container scale.`}
      </div>
    </div>
  );
}

function OffcutTile({ o }: { o: SubMoqOffcut; inLot: boolean }) {
  const sm = statusMeta[o.status];
  const Icon = sm.icon;
  return (
    <div
      className="bb-luxury-card p-3 flex flex-col gap-2"
      style={{ borderColor: o.status === "flagged" ? "rgba(239,68,68,0.30)" : undefined, opacity: o.matchScore < 0.6 ? 0.72 : 1 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-base leading-none">{clusterFlag[o.cluster]}</span>
        <Icon className="w-3.5 h-3.5" style={{ color: o.status === "verified" ? "var(--bb-success)" : o.status === "pending" ? "var(--bb-warning)" : "var(--bb-danger)" }} />
      </div>
      <div className="text-bb-caption font-medium text-bb-text-primary leading-tight truncate">{o.supplierName}</div>
      <div className="text-bb-micro text-bb-text-muted leading-tight">{o.color} · {o.composition}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-bb-caption bb-numeric text-bb-text-primary">{fmtKg(o.volumeKg)}</span>
        <span className="text-bb-micro bb-numeric" style={{ color: o.matchScore >= 0.85 ? "var(--bb-success)" : o.matchScore >= 0.6 ? "var(--bb-warning)" : "var(--bb-danger)" }}>
          {Math.round(o.matchScore * 100)}% match
        </span>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-bb-text-muted">{label}</span>
      <span className="text-bb-text-primary text-right">{value}</span>
    </div>
  );
}
