import type { ActivityItem, Deadline } from "./types";

export const activity: ActivityItem[] = [
  { id: "a1", at: "2026-07-20T08:02:00Z", kind: "flag", actor: "Extraction engine", message: "SD-2026-0468 (Cortina Ottica) flagged — no certificate number, cannot enter mass balance." },
  { id: "a2", at: "2026-07-20T05:10:00Z", kind: "extract", actor: "Extraction engine", message: "TC-2026-0463 (Dolomiti Frame Works) extracted — 690 kg, 100% pre-industrial, awaiting review." },
  { id: "a3", at: "2026-07-19T22:03:00Z", kind: "flag", actor: "Double-counting monitor", message: "TC-2026-0455 (Ruian) — GRS credit cannot be booked to an ISCC PLUS balance; held out of attribution." },
  { id: "a4", at: "2026-07-19T14:41:00Z", kind: "extract", actor: "Extraction engine", message: "SD-2026-0431 (Artigiana) extracted with 2 gaps — feedstock category & signatory role." },
  { id: "a5", at: "2026-07-18T09:12:00Z", kind: "verify", actor: "Chen Wei", message: "TC-2026-0412 (Ouhai Precision) verified and booked to Wenzhou MB-2026-Q2." },
  { id: "a6", at: "2026-07-16T13:40:00Z", kind: "aggregate", actor: "Lot engine", message: "LOT-AR-2026-014 reached 90% of MOQ — 4,520 / 5,000 kg across 4 suppliers." },
  { id: "a7", at: "2026-07-14T16:20:00Z", kind: "sign", actor: "Giulia Ferraro", message: "PACK-2026-Q2-IT-01 signed — Cadore Q2 Renew acetate sheet substantiation." },
  { id: "a8", at: "2026-06-02T10:15:00Z", kind: "audit", actor: "Mass-balance monitor", message: "Tây Ninh MB-2026-Q2 flagged in breach — attribution exceeds certified input." },
];

export const deadlines: Deadline[] = [
  { id: "d-dpp", regime: "ESPR / DPP", label: "DPP central registry operational", date: "2026-07-19", detail: "EU Digital Product Passport central registry must be operational. Feedstock-provenance export must be DPP-ready." },
  { id: "d-ppwr", regime: "PPWR", label: "PPWR applies", date: "2026-08-12", detail: "Regulation (EU) 2025/40 applies. Personally-signed Declaration of Conformity backs every recycled-content claim; only post-consumer recyclate counts toward 2030 targets." },
  { id: "d-empco", regime: "EmpCo", label: "EmpCo applies", date: "2026-09-27", detail: "Directive (EU) 2024/825 — generic, unsubstantiated environmental claims banned; verifiable substantiation required." },
  { id: "d-method", regime: "PPWR", label: "Recycled-content methodology act due", date: "2026-12-31", detail: "Implementing act establishing the recycled-content calculation / verification / certification methodology." },
];

// Today, in-app, is 20 Jul 2026.
export const APP_TODAY = new Date("2026-07-20T00:00:00Z");

export function daysUntil(dateISO: string): number {
  const target = new Date(dateISO + "T00:00:00Z").getTime();
  return Math.round((target - APP_TODAY.getTime()) / 86_400_000);
}
