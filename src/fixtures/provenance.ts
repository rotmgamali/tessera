import type { GraphNode, GraphEdge } from "./types";

// Two-sided provenance network: fragmented waste generators / converters on
// one side, recyclers / buy-back programs (and downstream brands) on the
// other. Nodes carry normalized x/y for a hand-rolled SVG node-link graph.
// This is the compounding, un-backfillable data asset.

export const graphNodes: GraphNode[] = [
  // Column 1 — fragmented suppliers (left)
  { id: "sup-artigiana", label: "Artigiana Occhiali", kind: "supplier", cluster: "italy", x: 0.08, y: 0.10, verifiedTonnes: 3.4 },
  { id: "sup-dolomiti", label: "Dolomiti Frame Works", kind: "supplier", cluster: "italy", x: 0.08, y: 0.24, verifiedTonnes: 2.1 },
  { id: "sup-ouhai", label: "Ouhai Precision", kind: "supplier", cluster: "china", x: 0.08, y: 0.38, verifiedTonnes: 5.7 },
  { id: "sup-lucheng", label: "Lucheng Optical", kind: "supplier", cluster: "china", x: 0.08, y: 0.52, verifiedTonnes: 4.2 },
  { id: "sup-ruian", label: "Ruian Offcuts", kind: "supplier", cluster: "china", x: 0.08, y: 0.66, verifiedTonnes: 1.3 },
  { id: "sup-trangbang", label: "Trảng Bàng Co-op", kind: "supplier", cluster: "vietnam", x: 0.08, y: 0.80, verifiedTonnes: 2.8 },
  { id: "sup-binhduong", label: "Bình Dương Trim", kind: "supplier", cluster: "vietnam", x: 0.08, y: 0.93, verifiedTonnes: 0.7 },

  // Column 2 — our converter sites
  { id: "site-cadore", label: "Cadore — Domegge", kind: "converter", cluster: "italy", x: 0.40, y: 0.24, verifiedTonnes: 84.2 },
  { id: "site-wenzhou", label: "Cadore — Wenzhou", kind: "converter", cluster: "china", x: 0.40, y: 0.52, verifiedTonnes: 52.6 },
  { id: "site-tayninh", label: "Cadore — Tây Ninh", kind: "converter", cluster: "vietnam", x: 0.40, y: 0.80, verifiedTonnes: 18.4 },

  // Column 3 — recyclers / buy-back programs
  { id: "rec-eastman", label: "Eastman Acetate Renew", kind: "recycler", cluster: "italy", x: 0.70, y: 0.34, verifiedTonnes: 96.5 },
  { id: "rec-mazzucchelli", label: "Mazzucchelli 1849", kind: "recycler", cluster: "italy", x: 0.70, y: 0.62, verifiedTonnes: 71.3 },

  // Column 4 — downstream brands
  { id: "brand-mykita", label: "Northlight Eyewear", kind: "brand", cluster: "italy", x: 0.94, y: 0.40, verifiedTonnes: 41.0 },
  { id: "brand-andywolf", label: "Wolfram Optik", kind: "brand", cluster: "italy", x: 0.94, y: 0.66, verifiedTonnes: 28.6 },
];

export const graphEdges: GraphEdge[] = [
  // suppliers → converter sites (offcuts in)
  { from: "sup-artigiana", to: "site-cadore", tonnes: 3.4, verified: true, certRef: "TC-2026-0402" },
  { from: "sup-dolomiti", to: "site-cadore", tonnes: 2.1, verified: true, certRef: "TC-2026-0463" },
  { from: "sup-ouhai", to: "site-wenzhou", tonnes: 5.7, verified: true, certRef: "TC-2026-0412" },
  { from: "sup-lucheng", to: "site-wenzhou", tonnes: 4.2, verified: true, certRef: "TC-2026-0447" },
  { from: "sup-ruian", to: "site-wenzhou", tonnes: 1.3, verified: false, certRef: "GRS-TC-CN-11902" },
  { from: "sup-trangbang", to: "site-tayninh", tonnes: 2.8, verified: true, certRef: "TC-2026-0470" },
  { from: "sup-binhduong", to: "site-tayninh", tonnes: 0.7, verified: false, certRef: "SD-2026-0472" },

  // converter sites ↔ recyclers (reciprocal buy-back)
  { from: "site-cadore", to: "rec-mazzucchelli", tonnes: 62.0, verified: true, certRef: "TC-2026-0388" },
  { from: "site-wenzhou", to: "rec-eastman", tonnes: 50.4, verified: true, certRef: "TC-2026-0389" },
  { from: "site-tayninh", to: "rec-mazzucchelli", tonnes: 17.8, verified: true, certRef: "TC-2026-0371" },
  { from: "rec-eastman", to: "rec-mazzucchelli", tonnes: 44.0, verified: true, certRef: "TC-2026-0355" },

  // converter sites → brands (attributed output)
  { from: "site-cadore", to: "brand-mykita", tonnes: 24.6, verified: true, certRef: "ATTR-IT-0091" },
  { from: "site-cadore", to: "brand-andywolf", tonnes: 17.3, verified: true, certRef: "ATTR-IT-0104" },
  { from: "site-wenzhou", to: "brand-mykita", tonnes: 16.4, verified: true, certRef: "ATTR-CN-0067" },
  { from: "site-tayninh", to: "brand-andywolf", tonnes: 11.3, verified: true, certRef: "ATTR-VN-0028" },
];
