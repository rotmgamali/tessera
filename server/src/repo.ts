import { query } from "./db.js";
import {
  computeMassBalance,
  type EngineEntry,
  type EnginePeriod,
  type MassBalanceResult,
  type SiteCert,
  type Standard,
  type Health,
} from "./engine/massBalance.js";

export interface SiteRow {
  id: string;
  name: string;
  cluster: string;
  location: string;
  iscc_cert_no: string;
  balance_standard: string;
  conversion_factor: number;
  last_audit_date: string | null;
  next_audit_date: string | null;
}

interface EntryRow {
  id: string;
  site_id: string;
  period_id: string;
  entry_date: string;
  type: "input" | "output";
  evidence_ref: string;
  description: string;
  quantity_kg: number;
  conversion_factor: number | null;
  standard: string | null;
  note: string | null;
}

const iso = (d: string | Date | null): string =>
  d == null ? "" : (typeof d === "string" ? d : d.toISOString()).slice(0, 10);

export async function getSites(): Promise<SiteRow[]> {
  const { rows } = await query<SiteRow>(
    `SELECT id, name, cluster, location, iscc_cert_no, balance_standard,
            conversion_factor::float8 AS conversion_factor, last_audit_date, next_audit_date
     FROM sites ORDER BY id`,
  );
  return rows;
}

export async function getSiteCerts(siteId: string): Promise<SiteCert[]> {
  const { rows } = await query<{ standard: string; cert_no: string }>(
    `SELECT standard, cert_no FROM site_certificates WHERE site_id = $1 ORDER BY id`,
    [siteId],
  );
  return rows.map((r) => ({ standard: r.standard as Standard, certNo: r.cert_no }));
}

export async function getPeriods(siteId: string): Promise<EnginePeriod[]> {
  const { rows } = await query<{ id: string; label: string; starts_on: string; ends_on: string }>(
    `SELECT id, label, starts_on, ends_on FROM mb_periods WHERE site_id = $1 ORDER BY starts_on`,
    [siteId],
  );
  return rows.map((r) => ({ id: r.id, label: r.label, startsOn: iso(r.starts_on), endsOn: iso(r.ends_on) }));
}

async function getEntries(siteId: string, periodId: string): Promise<EngineEntry[]> {
  const { rows } = await query<EntryRow>(
    `SELECT * FROM ledger_entries WHERE site_id = $1 AND period_id = $2 ORDER BY entry_date, id`,
    [siteId, periodId],
  );
  return rows.map(mapEntry);
}

function mapEntry(r: EntryRow): EngineEntry {
  return {
    id: r.id,
    type: r.type,
    date: iso(r.entry_date),
    evidenceRef: r.evidence_ref,
    description: r.description,
    quantityKg: Number(r.quantity_kg),
    conversionFactor: r.conversion_factor == null ? 0 : Number(r.conversion_factor),
    standard: (r.standard ?? undefined) as Standard | undefined,
    note: r.note ?? undefined,
  };
}

/**
 * Compute the mass balance for a site+period, chaining the opening balance
 * from every prior period's computed closing balance (periods are contiguous
 * per site). Returns null if the site or period is unknown.
 */
export async function computeSitePeriod(
  siteId: string,
  periodId: string,
): Promise<{ site: SiteRow; result: MassBalanceResult } | null> {
  const site = (await getSites()).find((s) => s.id === siteId);
  if (!site) return null;

  const periods = await getPeriods(siteId);
  const period = periods.find((p) => p.id === periodId);
  if (!period) return null;

  const certs = await getSiteCerts(siteId);
  const cf = Number(site.conversion_factor);
  const balanceStandard = site.balance_standard as Standard;

  // Walk periods in chronological order up to the requested one, chaining
  // each closing balance into the next opening balance.
  const upto = periods.filter((p) => p.startsOn <= period.startsOn);
  let opening = 0;
  let result: MassBalanceResult | null = null;
  for (const p of upto) {
    const entries = await getEntries(siteId, p.id);
    result = computeMassBalance({
      siteId,
      balanceStandard,
      siteCerts: certs,
      conversionFactor: cf,
      openingBalanceKg: opening,
      period: p,
      entries,
      sitePeriods: periods,
    });
    opening = result.closingBalanceKg;
  }

  return { site, result: result! };
}

/** Health for a site = health of its latest period's computed balance. */
export async function getSiteHealth(siteId: string): Promise<{ health: Health; latest: MassBalanceResult | null }> {
  const periods = await getPeriods(siteId);
  if (periods.length === 0) return { health: "healthy", latest: null };
  const latest = periods[periods.length - 1];
  const computed = await computeSitePeriod(siteId, latest.id);
  return { health: computed?.result.health ?? "healthy", latest: computed?.result ?? null };
}

export interface DashboardData {
  kpis: {
    certsInFlight: number;
    totalCerts: number;
    pendingReviews: number;
    verifiedTonnes: number;
    sitesHealthy: number;
    sitesWatch: number;
    sitesBreach: number;
    sitesTotal: number;
  };
  sites: Array<{
    id: string;
    name: string;
    cluster: string;
    isccCertNo: string;
    currentPeriodLabel: string;
    poolKg: number;
    attributedKg: number;
    closingKg: number;
    health: Health;
  }>;
  activity: Array<{ id: string; at: string; kind: string; actor: string; message: string }>;
}

export async function getDashboard(): Promise<DashboardData> {
  const sites = await getSites();

  const siteCards: DashboardData["sites"] = [];
  let healthy = 0;
  let watch = 0;
  let breach = 0;
  for (const s of sites) {
    const { health, latest } = await getSiteHealth(s.id);
    if (health === "healthy") healthy++;
    else if (health === "watch") watch++;
    else breach++;
    siteCards.push({
      id: s.id,
      name: s.name,
      cluster: s.cluster,
      isccCertNo: s.iscc_cert_no,
      currentPeriodLabel: latest?.periodId ?? "—",
      poolKg: latest?.poolKg ?? 0,
      attributedKg: latest?.attributedOutputsKg ?? 0,
      closingKg: latest?.closingBalanceKg ?? 0,
      health,
    });
  }

  const certs = await query<{ status: string }>(`SELECT status FROM certificates`);
  const totalCerts = certs.rows.length;
  const verified = certs.rows.filter((c) => c.status === "verified").length;
  const pendingReviews = certs.rows.filter(
    (c) => c.status === "needs-review" || c.status === "flagged",
  ).length;

  const tonnes = await query<{ t: string }>(
    `SELECT COALESCE(SUM(verified_tonnes),0)::float8 AS t FROM parties WHERE kind = 'supplier'`,
  );
  const verifiedTonnes = Math.round(Number(tonnes.rows[0]?.t ?? 0) * 10) / 10;

  const activityRows = await query<{ id: string; at: Date; kind: string; actor: string; message: string }>(
    `SELECT id, at, kind, actor, message FROM activity ORDER BY at DESC LIMIT 12`,
  );

  return {
    kpis: {
      certsInFlight: totalCerts - verified,
      totalCerts,
      pendingReviews,
      verifiedTonnes,
      sitesHealthy: healthy,
      sitesWatch: watch,
      sitesBreach: breach,
      sitesTotal: sites.length,
    },
    sites: siteCards,
    activity: activityRows.rows.map((a) => ({
      id: a.id,
      at: (typeof a.at === "string" ? new Date(a.at) : a.at).toISOString(),
      kind: a.kind,
      actor: a.actor,
      message: a.message,
    })),
  };
}
