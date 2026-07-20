// ── Tessera fixture domain model ─────────────────────────────────────
// Shared, well-typed mock data for the acetate-ecosystem wedge demo.
// Everything here is hardcoded fixture data — no backend, no DB.

export type CertStatus = "extracted" | "needs-review" | "verified" | "flagged";

export type MassBalanceHealth = "healthy" | "watch" | "breach";

export type SiteCluster = "italy" | "china" | "vietnam";

export interface Site {
  id: string;
  name: string;
  cluster: SiteCluster;
  location: string;
  iscCertNo: string;          // ISCC PLUS certificate number
  health: MassBalanceHealth;
  /** Current continuous mass-balance period label */
  currentPeriod: string;
  /** Certified recycled feedstock booked in this period (kg) */
  creditBalanceKg: number;
  /** Credits attributed to output products this period (kg) */
  attributedKg: number;
  conversionFactor: number;   // consumption/conversion factor (yield)
  lastAuditDate: string;
  nextAuditDate: string;
}

export type PartyKind =
  | "supplier"        // fragmented offcut generator
  | "converter"       // our customer's own sites
  | "recycler"        // molecular recycler / buy-back program
  | "brand";          // downstream eyewear brand

export interface Party {
  id: string;
  name: string;
  kind: PartyKind;
  cluster: SiteCluster;
  location: string;
  iscCertified: boolean;
  /** Tonnes of verified chain-of-custody material transacted via Tessera */
  verifiedTonnes: number;
  /** Typical acetate grade/color they generate or accept */
  material?: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  /** Extraction confidence 0–1 */
  confidence: number;
  status: "match" | "mismatch" | "gap";
  note?: string;
}

export interface Certificate {
  id: string;
  /** Human reference, e.g. TC-2026-0412 */
  ref: string;
  docType:
    | "Transaction Certificate"
    | "Supplier Declaration"
    | "Reclaimed Material Declaration"
    | "Delivery / Weighbridge Note";
  supplierId: string;
  supplierName: string;
  destinationSiteId: string;
  status: CertStatus;
  receivedAt: string;
  material: string;
  netWeightKg: number;
  recycledContentPct: number;
  standard: "ISCC PLUS" | "GRS" | "ISCC PLUS 203-2";
  /** Number of unresolved gap/mismatch flags */
  flagCount: number;
  extractionConfidence: number;   // overall 0–1
  fields: ExtractedField[];
}

export interface LedgerEntry {
  id: string;
  siteId: string;
  period: string;
  date: string;
  type: "input" | "output";
  /** Linked certificate ref (evidence) */
  evidenceRef: string;
  description: string;
  /** Certified quantity in kg (positive for input, output is attribution) */
  quantityKg: number;
  conversionFactor?: number;
  /** Running certified credit balance after this entry (kg) */
  runningBalanceKg: number;
  doubleCountRisk?: "none" | "warning" | "blocked";
  note?: string;
}

export interface SubMoqOffcut {
  id: string;
  supplierId: string;
  supplierName: string;
  cluster: SiteCluster;
  grade: string;
  color: string;
  composition: string;   // e.g. "≥60% bio-content"
  volumeKg: number;
  recycledContentPct: number;
  status: "verified" | "pending" | "flagged";
  matchScore: number;    // 0–1 spec match to the target lot
}

export interface CertifiedLot {
  id: string;
  ref: string;
  /** Recycler / buy-back program the lot is destined for */
  buyerId: string;
  buyerName: string;
  specGrade: string;
  specColor: string;
  specComposition: string;
  moqKg: number;         // minimum order quantity threshold
  filledKg: number;      // aggregated so far
  status: "filling" | "spec-locked" | "ready" | "shipped";
  offcutIds: string[];
}

export type PackStage = "draft" | "in-review" | "signed";

export interface SubstantiationPack {
  id: string;
  ref: string;
  title: string;
  siteId: string;
  period: string;
  claim: string;              // the recycled-content claim being substantiated
  targetRegime: ("PPWR" | "EmpCo" | "DPP")[];
  stage: PackStage;
  reviewer?: string;
  reviewerTitle?: string;
  signedAt?: string;
  liabilityNote: string;
  contents: { label: string; count: number; included: boolean }[];
  evidenceTonnes: number;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: PartyKind;
  cluster: SiteCluster;
  /** normalized layout position 0–1 */
  x: number;
  y: number;
  verifiedTonnes: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  tonnes: number;
  verified: boolean;
  certRef: string;
}

export interface ActivityItem {
  id: string;
  at: string;
  kind: "extract" | "verify" | "flag" | "sign" | "aggregate" | "audit";
  actor: string;
  message: string;
}

export interface Deadline {
  id: string;
  regime: string;
  label: string;
  date: string;        // ISO
  detail: string;
}
