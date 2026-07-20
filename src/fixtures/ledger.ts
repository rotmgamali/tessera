import type { LedgerEntry } from "./types";

// Site-specific, continuous-period mass-balance ledger entries enforcing
// ISCC PLUS 203-2 rules: certified feedstock inputs, attribution to output
// products, conversion/consumption-factor loss accounting, and hard
// double-counting prevention. Keyed by site + MB period.

export const ledgerEntries: LedgerEntry[] = [
  // ── Cadore (Italy) — healthy ────────────────────────────────────────
  {
    id: "le-it-1", siteId: "site-cadore", period: "MB-2026-Q2", date: "2026-04-03",
    type: "input", evidenceRef: "TC-2026-0301", description: "Certified acetate offcut in — Artigiana Occhiali",
    quantityKg: 3_400, runningBalanceKg: 3_400, doubleCountRisk: "none",
  },
  {
    id: "le-it-2", siteId: "site-cadore", period: "MB-2026-Q2", date: "2026-04-21",
    type: "input", evidenceRef: "TC-2026-0463", description: "Certified acetate flake in — Dolomiti Frame Works",
    quantityKg: 690, runningBalanceKg: 4_090, doubleCountRisk: "none",
  },
  {
    id: "le-it-3", siteId: "site-cadore", period: "MB-2026-Q2", date: "2026-05-02",
    type: "input", evidenceRef: "TC-2026-0388", description: "Buy-back flake in — Mazzucchelli 1849",
    quantityKg: 62_000, runningBalanceKg: 66_090, doubleCountRisk: "none",
  },
  {
    id: "le-it-4", siteId: "site-cadore", period: "MB-2026-Q2", date: "2026-05-18",
    type: "input", evidenceRef: "TC-2026-0402", description: "Certified acetate sheet in — Artigiana Occhiali",
    quantityKg: 18_110, runningBalanceKg: 84_200, doubleCountRisk: "none",
  },
  {
    id: "le-it-5", siteId: "site-cadore", period: "MB-2026-Q2", date: "2026-05-30",
    type: "output", evidenceRef: "ATTR-IT-0091", description: "Attributed to Renew acetate sheet — Northlight order",
    quantityKg: 44_600, conversionFactor: 0.82, runningBalanceKg: 39_600, doubleCountRisk: "none",
    note: "Free-attribution to premium sheet; 0.82 yield applied.",
  },
  {
    id: "le-it-6", siteId: "site-cadore", period: "MB-2026-Q2", date: "2026-06-14",
    type: "output", evidenceRef: "ATTR-IT-0104", description: "Attributed to Renew acetate sheet — Wolfram Optik order",
    quantityKg: 17_340, conversionFactor: 0.82, runningBalanceKg: 22_260, doubleCountRisk: "none",
  },

  // ── Wenzhou (China) — watch ─────────────────────────────────────────
  {
    id: "le-cn-1", siteId: "site-wenzhou", period: "MB-2026-Q2", date: "2026-04-08",
    type: "input", evidenceRef: "TC-2026-0412", description: "Certified acetate flake in — Ouhai Precision",
    quantityKg: 1_240, runningBalanceKg: 1_240, doubleCountRisk: "none",
  },
  {
    id: "le-cn-2", siteId: "site-wenzhou", period: "MB-2026-Q2", date: "2026-04-25",
    type: "input", evidenceRef: "TC-2026-0447", description: "Certified acetate sheet trim in — Lucheng Optical",
    quantityKg: 980, runningBalanceKg: 2_220, doubleCountRisk: "none",
  },
  {
    id: "le-cn-3", siteId: "site-wenzhou", period: "MB-2026-Q2", date: "2026-05-11",
    type: "input", evidenceRef: "TC-2026-0389", description: "Buy-back flake in — Eastman Acetate Renew",
    quantityKg: 50_380, runningBalanceKg: 52_600, doubleCountRisk: "none",
  },
  {
    id: "le-cn-4", siteId: "site-wenzhou", period: "MB-2026-Q2", date: "2026-05-27",
    type: "input", evidenceRef: "GRS-TC-CN-11902", description: "GRS flake in — Ruian Frame Offcuts",
    quantityKg: 540, runningBalanceKg: 53_140, doubleCountRisk: "warning",
    note: "GRS credit staged against an ISCC PLUS balance — blocked from attribution pending review.",
  },
  {
    id: "le-cn-5", siteId: "site-wenzhou", period: "MB-2026-Q2", date: "2026-06-09",
    type: "output", evidenceRef: "ATTR-CN-0067", description: "Attributed to Renew acetate frames — Northlight",
    quantityKg: 49_180, conversionFactor: 0.79, runningBalanceKg: 3_960, doubleCountRisk: "none",
  },

  // ── Tay Ninh (Vietnam) — breach ─────────────────────────────────────
  {
    id: "le-vn-1", siteId: "site-tayninh", period: "MB-2026-Q2", date: "2026-04-15",
    type: "input", evidenceRef: "TC-2026-0470", description: "Certified acetate offcut in — Trảng Bàng Co-op",
    quantityKg: 610, runningBalanceKg: 610, doubleCountRisk: "none",
  },
  {
    id: "le-vn-2", siteId: "site-tayninh", period: "MB-2026-Q2", date: "2026-05-01",
    type: "input", evidenceRef: "TC-2026-0371", description: "Buy-back flake in — Mazzucchelli 1849",
    quantityKg: 17_790, runningBalanceKg: 18_400, doubleCountRisk: "none",
  },
  {
    id: "le-vn-3", siteId: "site-tayninh", period: "MB-2026-Q2", date: "2026-06-02",
    type: "output", evidenceRef: "ATTR-VN-0028", description: "Attributed to Renew acetate frames — Wolfram Optik",
    quantityKg: 21_050, conversionFactor: 0.77, runningBalanceKg: -2_650, doubleCountRisk: "blocked",
    note: "Attribution exceeds certified input — negative balance. ISCC PLUS 203-2 breach: over-attribution.",
  },
];

export const ledgerForSite = (siteId: string, period: string): LedgerEntry[] =>
  ledgerEntries.filter((e) => e.siteId === siteId && e.period === period);

export const periods = ["MB-2026-Q2", "MB-2026-Q1"];
