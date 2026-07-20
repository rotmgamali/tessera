import { Router, type Request, type Response } from "express";
import {
  getSites,
  getSiteCerts,
  getPeriods,
  getSiteHealth,
  computeSitePeriod,
  getDashboard,
} from "./repo.js";

export const api = Router();

// GET /api/sites — sites with their ISCC/GRS certificates and computed health.
api.get("/sites", async (_req: Request, res: Response) => {
  const sites = await getSites();
  const out = [];
  for (const s of sites) {
    const [certs, { health }] = await Promise.all([getSiteCerts(s.id), getSiteHealth(s.id)]);
    out.push({
      id: s.id,
      name: s.name,
      cluster: s.cluster,
      location: s.location,
      isccCertNo: s.iscc_cert_no,
      balanceStandard: s.balance_standard,
      conversionFactor: Number(s.conversion_factor),
      lastAuditDate: s.last_audit_date,
      nextAuditDate: s.next_audit_date,
      certs,
      health,
    });
  }
  res.json({ sites: out });
});

// GET /api/periods?site=<id> — periods for the site selector (newest first).
api.get("/periods", async (req: Request, res: Response) => {
  const siteId = String(req.query.site ?? "");
  if (!siteId) return res.status(400).json({ error: "Missing ?site" });
  const periods = await getPeriods(siteId);
  res.json({ periods: [...periods].reverse() });
});

// GET /api/ledger?site=<id>&period=<id> — computed mass balance + violations.
api.get("/ledger", async (req: Request, res: Response) => {
  const siteId = String(req.query.site ?? "");
  const periodId = String(req.query.period ?? "");
  if (!siteId || !periodId) return res.status(400).json({ error: "Missing ?site and/or ?period" });

  const computed = await computeSitePeriod(siteId, periodId);
  if (!computed) return res.status(404).json({ error: "Unknown site or period" });

  const { site, result } = computed;
  res.json({
    site: {
      id: site.id,
      name: site.name,
      cluster: site.cluster,
      isccCertNo: site.iscc_cert_no,
      conversionFactor: Number(site.conversion_factor),
      health: result.health,
    },
    period: { id: result.periodId, label: (await getPeriods(siteId)).find((p) => p.id === periodId)?.label ?? periodId },
    summary: {
      openingBalanceKg: result.openingBalanceKg,
      creditedInputsKg: result.creditedInputsKg,
      attributedOutputsKg: result.attributedOutputsKg,
      lossesKg: result.lossesKg,
      poolKg: result.poolKg,
      closingBalanceKg: result.closingBalanceKg,
      conversionFactor: result.conversionFactor,
      health: result.health,
    },
    entries: result.entries.map((e) => ({
      id: e.id,
      siteId,
      period: result.periodId,
      date: e.date,
      type: e.type,
      evidenceRef: e.evidenceRef,
      description: e.description,
      quantityKg: e.quantityKg,
      conversionFactor: e.type === "input" && e.credited ? e.conversionFactor : e.conversionFactor || undefined,
      runningBalanceKg: e.runningBalanceKg,
      doubleCountRisk: e.doubleCountRisk,
      credited: e.credited,
      note: e.note,
    })),
    violations: result.violations,
  });
});

// GET /api/dashboard — KPI tiles, per-site mass-balance health, recent activity.
api.get("/dashboard", async (_req: Request, res: Response) => {
  res.json(await getDashboard());
});
