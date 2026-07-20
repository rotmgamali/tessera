import type { SubstantiationPack } from "./types";

// Audit-ready substantiation packs: EmpCo/PPWR dossier + DPP-ready
// feedstock-provenance export. Human-in-the-loop sign-off (draft →
// in-review → signed) is what gives the output liability weight.

export const packs: SubstantiationPack[] = [
  {
    id: "pack-1",
    ref: "PACK-2026-Q2-IT-01",
    title: "Cadore Q2 — Renew Acetate Sheet Substantiation",
    siteId: "site-cadore",
    period: "MB-2026-Q2",
    claim: "27% ISCC PLUS certified recycled content, achieved via mass balance",
    targetRegime: ["PPWR", "EmpCo", "DPP"],
    stage: "signed",
    reviewer: "Giulia Ferraro",
    reviewerTitle: "Head of Sustainability & Compliance",
    signedAt: "2026-07-14T16:20:00Z",
    liabilityNote:
      "Signatory attests the underlying mass-balance records are site-specific, continuous, and free of double-counting. Under PPWR the signatory of the Declaration of Conformity is personally liable for the substantiated claim.",
    contents: [
      { label: "Verified transaction certificates", count: 12, included: true },
      { label: "Site mass-balance statement (203-2)", count: 1, included: true },
      { label: "Conversion-factor evidence", count: 3, included: true },
      { label: "Double-counting prevention log", count: 1, included: true },
      { label: "DPP feedstock-provenance export", count: 1, included: true },
    ],
    evidenceTonnes: 84.2,
  },
  {
    id: "pack-2",
    ref: "PACK-2026-Q2-CN-01",
    title: "Wenzhou Q2 — Renew Acetate Frames Substantiation",
    siteId: "site-wenzhou",
    period: "MB-2026-Q2",
    claim: "24% ISCC PLUS certified recycled content, achieved via mass balance",
    targetRegime: ["PPWR", "EmpCo"],
    stage: "in-review",
    reviewer: "Chen Wei",
    reviewerTitle: "Site Compliance Lead",
    liabilityNote:
      "Pending reviewer sign-off. One input (GRS-TC-CN-11902) is held out of attribution pending a double-counting determination; the pack cannot be signed until it clears.",
    contents: [
      { label: "Verified transaction certificates", count: 9, included: true },
      { label: "Site mass-balance statement (203-2)", count: 1, included: true },
      { label: "Conversion-factor evidence", count: 2, included: true },
      { label: "Double-counting prevention log", count: 1, included: true },
      { label: "Flagged GRS credit (held out)", count: 1, included: false },
      { label: "DPP feedstock-provenance export", count: 1, included: false },
    ],
    evidenceTonnes: 52.6,
  },
  {
    id: "pack-3",
    ref: "PACK-2026-Q2-VN-01",
    title: "Tây Ninh Q2 — Renew Acetate Frames Substantiation",
    siteId: "site-tayninh",
    period: "MB-2026-Q2",
    claim: "Draft — recycled-content % pending balance correction",
    targetRegime: ["PPWR", "EmpCo", "DPP"],
    stage: "draft",
    liabilityNote:
      "Cannot advance to review: the site mass balance is in breach (over-attribution, negative balance). Correct the MB-2026-Q2 ledger before assembling substantiation.",
    contents: [
      { label: "Verified transaction certificates", count: 4, included: true },
      { label: "Site mass-balance statement (203-2)", count: 1, included: false },
      { label: "Conversion-factor evidence", count: 1, included: true },
      { label: "Double-counting prevention log", count: 1, included: false },
      { label: "DPP feedstock-provenance export", count: 1, included: false },
    ],
    evidenceTonnes: 18.4,
  },
];

export const packById = (id: string): SubstantiationPack | undefined =>
  packs.find((p) => p.id === id);
