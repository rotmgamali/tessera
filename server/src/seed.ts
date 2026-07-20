import { getPool, query } from "./db.js";

// ─────────────────────────────────────────────────────────────────────
// Idempotent seed of the Cadore Ottica S.p.A. world — the SAME world as
// the frontend fixtures (same site names, ISCC certificate numbers, supplier
// names, evidence references) so the UI stays continuous when it switches
// from fixtures to the API.
//
// The two required breach scenarios are seeded as REAL data the engine then
// computes into violations (nothing is hardcoded as "breach"):
//   • Wenzhou — a GRS transaction certificate (GRS-TC-CN-11902) booked toward
//     an ISCC PLUS balance → STANDARD_MIX, held out of attribution → "watch".
//   • Tây Ninh — attributed certified output (21,050 kg) exceeds the credit
//     pool (18,400 kg × 0.77 = 14,168 kg) → OVER_ATTRIBUTION → "breach".
// ─────────────────────────────────────────────────────────────────────

interface SiteSeed {
  id: string;
  name: string;
  cluster: string;
  location: string;
  isccCertNo: string;
  conversionFactor: number;
  lastAuditDate: string;
  nextAuditDate: string;
}

const SITES: SiteSeed[] = [
  {
    id: "site-cadore",
    name: "Cadore Ottica — Domegge di Cadore",
    cluster: "italy",
    location: "Domegge di Cadore, Belluno, Italy",
    isccCertNo: "ISCC-PLUS-IT-2024-0417",
    conversionFactor: 0.82,
    lastAuditDate: "2026-03-11",
    nextAuditDate: "2027-03-10",
  },
  {
    id: "site-wenzhou",
    name: "Cadore Ottica — Wenzhou Plant",
    cluster: "china",
    location: "Ouhai District, Wenzhou, Zhejiang, China",
    isccCertNo: "ISCC-PLUS-CN-2024-1182",
    conversionFactor: 0.79,
    lastAuditDate: "2026-02-24",
    nextAuditDate: "2027-02-23",
  },
  {
    id: "site-tayninh",
    name: "Cadore Ottica — Tây Ninh Line",
    cluster: "vietnam",
    location: "Trảng Bàng, Tây Ninh, Vietnam",
    isccCertNo: "ISCC-PLUS-VN-2025-0356",
    conversionFactor: 0.77,
    lastAuditDate: "2026-05-06",
    nextAuditDate: "2027-05-05",
  },
];

interface CertSeed {
  id: string;
  siteId: string;
  standard: string;
  certNo: string;
}

const SITE_CERTS: CertSeed[] = [
  { id: "sc-it-plus", siteId: "site-cadore", standard: "ISCC PLUS", certNo: "ISCC-PLUS-IT-2024-0417" },
  // Domegge additionally holds an ISCC EU certificate — the dual-cert case the
  // engine watches for double-counting (same volume claimed under both).
  { id: "sc-it-eu", siteId: "site-cadore", standard: "ISCC EU", certNo: "ISCC-EU-IT-2023-0091" },
  { id: "sc-cn-plus", siteId: "site-wenzhou", standard: "ISCC PLUS", certNo: "ISCC-PLUS-CN-2024-1182" },
  // Wenzhou also holds a GRS scope certificate (why GRS material shows up there).
  { id: "sc-cn-grs", siteId: "site-wenzhou", standard: "GRS", certNo: "GRS-CN-2025-0442" },
  { id: "sc-vn-plus", siteId: "site-tayninh", standard: "ISCC PLUS", certNo: "ISCC-PLUS-VN-2025-0356" },
];

interface PeriodSeed {
  id: string;
  siteId: string;
  label: string;
  startsOn: string;
  endsOn: string;
}

const PERIODS: PeriodSeed[] = [
  // Cadore keeps two contiguous periods (Q1 chains its closing into Q2).
  { id: "MB-2026-Q1", siteId: "site-cadore", label: "MB-2026-Q1", startsOn: "2026-01-01", endsOn: "2026-03-31" },
  { id: "MB-2026-Q2", siteId: "site-cadore", label: "MB-2026-Q2 (Apr–Jun 2026)", startsOn: "2026-04-01", endsOn: "2026-06-30" },
  { id: "MB-2026-Q2", siteId: "site-wenzhou", label: "MB-2026-Q2 (Apr–Jun 2026)", startsOn: "2026-04-01", endsOn: "2026-06-30" },
  { id: "MB-2026-Q2", siteId: "site-tayninh", label: "MB-2026-Q2 (Apr–Jun 2026)", startsOn: "2026-04-01", endsOn: "2026-06-30" },
];

interface EntrySeed {
  id: string;
  siteId: string;
  periodId: string;
  date: string;
  type: "input" | "output";
  evidenceRef: string;
  description: string;
  quantityKg: number;
  conversionFactor: number | null;
  standard: string | null;
  note: string | null;
}

const ENTRIES: EntrySeed[] = [
  // ── Cadore Q1 (clean, closes +1,060 kg → opening balance for Q2) ──────
  { id: "le-it-q1-1", siteId: "site-cadore", periodId: "MB-2026-Q1", date: "2026-01-15", type: "input", evidenceRef: "TC-2026-0102", description: "Certified acetate offcut in — Artigiana Occhiali", quantityKg: 5_000, conversionFactor: 0.82, standard: "ISCC PLUS", note: null },
  { id: "le-it-q1-2", siteId: "site-cadore", periodId: "MB-2026-Q1", date: "2026-02-20", type: "input", evidenceRef: "TC-2026-0155", description: "Buy-back flake in — Mazzucchelli 1849", quantityKg: 3_000, conversionFactor: 0.82, standard: "ISCC PLUS", note: null },
  { id: "le-it-q1-3", siteId: "site-cadore", periodId: "MB-2026-Q1", date: "2026-03-10", type: "output", evidenceRef: "ATTR-IT-0044", description: "Attributed to Renew acetate sheet — Northlight order", quantityKg: 5_500, conversionFactor: 0.82, standard: null, note: "Free-attribution to premium sheet; 0.82 yield applied." },

  // ── Cadore Q2 (healthy) ───────────────────────────────────────────────
  { id: "le-it-1", siteId: "site-cadore", periodId: "MB-2026-Q2", date: "2026-04-03", type: "input", evidenceRef: "TC-2026-0301", description: "Certified acetate offcut in — Artigiana Occhiali", quantityKg: 3_400, conversionFactor: 0.82, standard: "ISCC PLUS", note: null },
  { id: "le-it-2", siteId: "site-cadore", periodId: "MB-2026-Q2", date: "2026-04-21", type: "input", evidenceRef: "TC-2026-0463", description: "Certified acetate flake in — Dolomiti Frame Works", quantityKg: 690, conversionFactor: 0.82, standard: "ISCC PLUS", note: null },
  { id: "le-it-3", siteId: "site-cadore", periodId: "MB-2026-Q2", date: "2026-05-02", type: "input", evidenceRef: "TC-2026-0388", description: "Buy-back flake in — Mazzucchelli 1849", quantityKg: 62_000, conversionFactor: 0.82, standard: "ISCC PLUS", note: null },
  { id: "le-it-4", siteId: "site-cadore", periodId: "MB-2026-Q2", date: "2026-05-18", type: "input", evidenceRef: "TC-2026-0402", description: "Certified acetate sheet in — Artigiana Occhiali", quantityKg: 18_110, conversionFactor: 0.82, standard: "ISCC PLUS", note: null },
  { id: "le-it-5", siteId: "site-cadore", periodId: "MB-2026-Q2", date: "2026-05-30", type: "output", evidenceRef: "ATTR-IT-0091", description: "Attributed to Renew acetate sheet — Northlight order", quantityKg: 44_600, conversionFactor: 0.82, standard: null, note: "Free-attribution to premium sheet; 0.82 yield applied." },
  { id: "le-it-6", siteId: "site-cadore", periodId: "MB-2026-Q2", date: "2026-06-14", type: "output", evidenceRef: "ATTR-IT-0104", description: "Attributed to Renew acetate sheet — Wolfram Optik order", quantityKg: 17_340, conversionFactor: 0.82, standard: null, note: null },

  // ── Wenzhou Q2 (watch — GRS input held out) ──────────────────────────
  { id: "le-cn-1", siteId: "site-wenzhou", periodId: "MB-2026-Q2", date: "2026-04-08", type: "input", evidenceRef: "TC-2026-0412", description: "Certified acetate flake in — Ouhai Precision", quantityKg: 1_240, conversionFactor: 0.79, standard: "ISCC PLUS", note: null },
  { id: "le-cn-2", siteId: "site-wenzhou", periodId: "MB-2026-Q2", date: "2026-04-25", type: "input", evidenceRef: "TC-2026-0447", description: "Certified acetate sheet trim in — Lucheng Optical", quantityKg: 980, conversionFactor: 0.79, standard: "ISCC PLUS", note: null },
  { id: "le-cn-3", siteId: "site-wenzhou", periodId: "MB-2026-Q2", date: "2026-05-11", type: "input", evidenceRef: "TC-2026-0389", description: "Buy-back flake in — Eastman Acetate Renew", quantityKg: 50_380, conversionFactor: 0.79, standard: "ISCC PLUS", note: null },
  { id: "le-cn-4", siteId: "site-wenzhou", periodId: "MB-2026-Q2", date: "2026-05-27", type: "input", evidenceRef: "GRS-TC-CN-11902", description: "GRS flake in — Ruian Frame Offcuts", quantityKg: 540, conversionFactor: 0.79, standard: "GRS", note: "GRS credit presented against an ISCC PLUS balance — standard mix." },
  { id: "le-cn-5", siteId: "site-wenzhou", periodId: "MB-2026-Q2", date: "2026-06-09", type: "output", evidenceRef: "ATTR-CN-0067", description: "Attributed to Renew acetate frames — Northlight", quantityKg: 39_000, conversionFactor: 0.79, standard: null, note: null },

  // ── Tây Ninh Q2 (breach — over-attribution) ──────────────────────────
  { id: "le-vn-1", siteId: "site-tayninh", periodId: "MB-2026-Q2", date: "2026-04-15", type: "input", evidenceRef: "TC-2026-0470", description: "Certified acetate offcut in — Trảng Bàng Co-op", quantityKg: 610, conversionFactor: 0.77, standard: "ISCC PLUS", note: null },
  { id: "le-vn-2", siteId: "site-tayninh", periodId: "MB-2026-Q2", date: "2026-05-01", type: "input", evidenceRef: "TC-2026-0371", description: "Buy-back flake in — Mazzucchelli 1849", quantityKg: 17_790, conversionFactor: 0.77, standard: "ISCC PLUS", note: null },
  { id: "le-vn-3", siteId: "site-tayninh", periodId: "MB-2026-Q2", date: "2026-06-02", type: "output", evidenceRef: "ATTR-VN-0028", description: "Attributed to Renew acetate frames — Wolfram Optik", quantityKg: 21_050, conversionFactor: 0.77, standard: null, note: "Attribution requested against thin certified input." },
];

interface PartySeed { id: string; name: string; kind: string; verifiedTonnes: number }
const SUPPLIERS: PartySeed[] = [
  { id: "sup-artigiana", name: "Artigiana Occhiali s.r.l.", kind: "supplier", verifiedTonnes: 3.4 },
  { id: "sup-dolomiti", name: "Dolomiti Frame Works", kind: "supplier", verifiedTonnes: 2.1 },
  { id: "sup-cortina", name: "Cortina Ottica Componenti", kind: "supplier", verifiedTonnes: 0.9 },
  { id: "sup-ouhai", name: "Ouhai Precision Eyewear Co.", kind: "supplier", verifiedTonnes: 5.7 },
  { id: "sup-lucheng", name: "Lucheng Optical Parts", kind: "supplier", verifiedTonnes: 4.2 },
  { id: "sup-ruian", name: "Ruian Frame Offcuts", kind: "supplier", verifiedTonnes: 1.3 },
  { id: "sup-trangbang", name: "Trảng Bàng Acetate Co-op", kind: "supplier", verifiedTonnes: 2.8 },
  { id: "sup-binhduong", name: "Bình Dương Optical Trim", kind: "supplier", verifiedTonnes: 0.7 },
];

interface CertRow { id: string; ref: string; status: string; standard: string; netWeightKg: number }
const CERTIFICATES: CertRow[] = [
  { id: "cert-0412", ref: "TC-2026-0412", status: "verified", standard: "ISCC PLUS 203-2", netWeightKg: 1_240 },
  { id: "cert-0431", ref: "SD-2026-0431", status: "needs-review", standard: "ISCC PLUS", netWeightKg: 860 },
  { id: "cert-0447", ref: "TC-2026-0447", status: "verified", standard: "ISCC PLUS 203-2", netWeightKg: 980 },
  { id: "cert-0455", ref: "TC-2026-0455", status: "flagged", standard: "GRS", netWeightKg: 540 },
  { id: "cert-0460", ref: "RMD-2026-0460", status: "needs-review", standard: "ISCC PLUS", netWeightKg: 420 },
  { id: "cert-0463", ref: "TC-2026-0463", status: "extracted", standard: "ISCC PLUS 203-2", netWeightKg: 690 },
  { id: "cert-0468", ref: "SD-2026-0468", status: "flagged", standard: "ISCC PLUS", netWeightKg: 310 },
  { id: "cert-0470", ref: "TC-2026-0470", status: "verified", standard: "ISCC PLUS 203-2", netWeightKg: 610 },
];

interface ActivityRow { id: string; at: string; kind: string; actor: string; message: string }
const ACTIVITY: ActivityRow[] = [
  { id: "a1", at: "2026-07-20T08:02:00Z", kind: "flag", actor: "Extraction engine", message: "SD-2026-0468 (Cortina Ottica) flagged — no certificate number, cannot enter mass balance." },
  { id: "a2", at: "2026-07-20T05:10:00Z", kind: "extract", actor: "Extraction engine", message: "TC-2026-0463 (Dolomiti Frame Works) extracted — 690 kg, 100% pre-industrial, awaiting review." },
  { id: "a3", at: "2026-07-19T22:03:00Z", kind: "flag", actor: "Double-counting monitor", message: "GRS-TC-CN-11902 (Ruian) — GRS credit cannot be booked to an ISCC PLUS balance; held out of attribution." },
  { id: "a4", at: "2026-07-19T14:41:00Z", kind: "extract", actor: "Extraction engine", message: "SD-2026-0431 (Artigiana) extracted with 2 gaps — feedstock category & signatory role." },
  { id: "a5", at: "2026-07-18T09:12:00Z", kind: "verify", actor: "Chen Wei", message: "TC-2026-0412 (Ouhai Precision) verified and booked to Wenzhou MB-2026-Q2." },
  { id: "a6", at: "2026-07-16T13:40:00Z", kind: "aggregate", actor: "Lot engine", message: "LOT-AR-2026-014 reached 90% of MOQ — 4,520 / 5,000 kg across 4 suppliers." },
  { id: "a7", at: "2026-07-14T16:20:00Z", kind: "sign", actor: "Giulia Ferraro", message: "PACK-2026-Q2-IT-01 signed — Cadore Q2 Renew acetate sheet substantiation." },
  { id: "a8", at: "2026-06-02T10:15:00Z", kind: "audit", actor: "Mass-balance monitor", message: "Tây Ninh MB-2026-Q2 flagged in breach — attribution exceeds certified input." },
];

/** Seeds the world once, only if the database is empty. Safe to run on boot. */
export async function seedIfEmpty(): Promise<boolean> {
  const { rows } = await query<{ count: string }>("SELECT COUNT(*)::int AS count FROM sites");
  if (Number(rows[0]?.count ?? 0) > 0) return false;

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    for (const s of SITES) {
      await client.query(
        `INSERT INTO sites (id, name, cluster, location, iscc_cert_no, balance_standard, conversion_factor, last_audit_date, next_audit_date)
         VALUES ($1,$2,$3,$4,$5,'ISCC PLUS',$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [s.id, s.name, s.cluster, s.location, s.isccCertNo, s.conversionFactor, s.lastAuditDate, s.nextAuditDate],
      );
    }
    for (const c of SITE_CERTS) {
      await client.query(
        `INSERT INTO site_certificates (id, site_id, standard, cert_no) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
        [c.id, c.siteId, c.standard, c.certNo],
      );
    }
    for (const p of PERIODS) {
      await client.query(
        `INSERT INTO mb_periods (id, site_id, label, starts_on, ends_on) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (site_id, id) DO NOTHING`,
        [p.id, p.siteId, p.label, p.startsOn, p.endsOn],
      );
    }
    for (const e of ENTRIES) {
      await client.query(
        `INSERT INTO ledger_entries (id, site_id, period_id, entry_date, type, evidence_ref, description, quantity_kg, conversion_factor, standard, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
        [e.id, e.siteId, e.periodId, e.date, e.type, e.evidenceRef, e.description, e.quantityKg, e.conversionFactor, e.standard, e.note],
      );
    }
    for (const p of SUPPLIERS) {
      await client.query(
        `INSERT INTO parties (id, name, kind, verified_tonnes) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.kind, p.verifiedTonnes],
      );
    }
    for (const c of CERTIFICATES) {
      await client.query(
        `INSERT INTO certificates (id, ref, status, standard, net_weight_kg) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [c.id, c.ref, c.status, c.standard, c.netWeightKg],
      );
    }
    for (const a of ACTIVITY) {
      await client.query(
        `INSERT INTO activity (id, at, kind, actor, message) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [a.id, a.at, a.kind, a.actor, a.message],
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
