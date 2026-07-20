import { useState } from "react";
import { Share2, Info } from "lucide-react";
import {
  graphNodes,
  graphEdges,
  type GraphNode,
  type PartyKind,
} from "../fixtures";

const W = 1000;
const H = 640;
const PAD_X = 90;
const PAD_Y = 40;

const kindColor: Record<PartyKind, string> = {
  supplier: "#3B82F6",
  converter: "#C9A84C",
  recycler: "#10B981",
  brand: "#8B5CF6",
};

const kindLabel: Record<PartyKind, string> = {
  supplier: "Fragmented supplier",
  converter: "Our converter site",
  recycler: "Recycler / buy-back",
  brand: "Downstream brand",
};

function px(n: GraphNode) {
  return { x: PAD_X + n.x * (W - 2 * PAD_X), y: PAD_Y + n.y * (H - 2 * PAD_Y) };
}

export default function Provenance() {
  const [hover, setHover] = useState<string | null>(null);

  const totalTonnes = graphEdges.filter((e) => e.verified).reduce((s, e) => s + e.tonnes, 0);
  const verifiedEdges = graphEdges.filter((e) => e.verified).length;

  const connected = new Set<string>();
  if (hover) {
    connected.add(hover);
    graphEdges.forEach((e) => {
      if (e.from === hover) connected.add(e.to);
      if (e.to === hover) connected.add(e.from);
    });
  }

  const nodePos = Object.fromEntries(graphNodes.map((n) => [n.id, px(n)]));

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Nodes in graph" value={`${graphNodes.length}`} />
        <Stat label="Verified transactions" value={`${verifiedEdges}`} />
        <Stat label="Traced feedstock" value={`${totalTonnes.toFixed(1)} t`} />
        <Stat label="Clusters" value="3 · IT / CN / VN" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-bb-caption">
        {(Object.keys(kindColor) as PartyKind[]).map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: kindColor[k] }} />
            <span className="text-bb-text-secondary">{kindLabel[k]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto text-bb-micro text-bb-text-muted">
          <Info className="w-3.5 h-3.5" /> Hover a node to trace its verified transactions
        </div>
      </div>

      {/* Graph */}
      <div className="bb-luxury-card p-2 overflow-x-auto">
        <div className="flex items-center gap-2 px-3 py-2">
          <Share2 className="w-4 h-4 text-bb-gold" />
          <span className="text-bb-caption text-bb-text-secondary">
            Two-sided provenance network — suppliers → converter sites → recyclers / buy-back → brands
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 720 }} role="img" aria-label="Provenance network graph">
          {/* Edges */}
          {graphEdges.map((e, i) => {
            const a = nodePos[e.from];
            const b = nodePos[e.to];
            if (!a || !b) return null;
            const active = !hover || e.from === hover || e.to === hover;
            const midX = (a.x + b.x) / 2;
            const strokeW = Math.max(1, Math.min(6, e.tonnes / 12));
            return (
              <path
                key={i}
                d={`M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`}
                fill="none"
                stroke={e.verified ? "var(--bb-gold)" : "var(--bb-danger)"}
                strokeWidth={strokeW}
                strokeDasharray={e.verified ? undefined : "5 4"}
                opacity={active ? (e.verified ? 0.5 : 0.6) : 0.08}
                style={{ transition: "opacity 150ms" }}
              />
            );
          })}

          {/* Nodes */}
          {graphNodes.map((n) => {
            const p = nodePos[n.id];
            const dim = hover && !connected.has(n.id);
            const r = 7 + Math.min(9, n.verifiedTonnes / 12);
            const c = kindColor[n.kind];
            const anchorRight = n.x > 0.6;
            return (
              <g
                key={n.id}
                opacity={dim ? 0.25 : 1}
                style={{ transition: "opacity 150ms", cursor: "pointer" }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                <circle cx={p.x} cy={p.y} r={r + 4} fill={c} opacity={0.15} />
                <circle cx={p.x} cy={p.y} r={r} fill={c} stroke="var(--bb-bg-deep)" strokeWidth={2} />
                <text
                  x={anchorRight ? p.x + r + 8 : p.x - r - 8}
                  y={p.y + 3}
                  textAnchor={anchorRight ? "start" : "end"}
                  fontSize={12}
                  fill="var(--bb-text-secondary)"
                  style={{ fontWeight: hover === n.id ? 600 : 400 }}
                >
                  {n.label}
                </text>
                <text
                  x={anchorRight ? p.x + r + 8 : p.x - r - 8}
                  y={p.y + 17}
                  textAnchor={anchorRight ? "start" : "end"}
                  fontSize={9.5}
                  fill="var(--bb-text-muted)"
                >
                  {n.verifiedTonnes} t
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-bb-caption text-bb-text-muted leading-relaxed max-w-3xl">
        Every edge is a verified transaction certificate booked through Tessera. This per-supplier, per-lot
        provenance history — accumulated transaction-by-transaction — is the compounding data asset a competitor
        with an identical app cannot backfill. Dashed red edges are unverified inputs held out of the certified graph.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bb-luxury-card p-4">
      <div className="text-bb-micro text-bb-text-muted uppercase tracking-wide mb-1">{label}</div>
      <div className="text-bb-stat bb-numeric text-bb-text-primary">{value}</div>
    </div>
  );
}
