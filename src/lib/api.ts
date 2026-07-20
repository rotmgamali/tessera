// ── Typed API client — hits the same-origin relative /api/* routes ──────
// The Ledger and Dashboard screens load from here (the other four screens
// stay on fixtures). In dev, Vite proxies /api to the local backend.

export type Health = "healthy" | "watch" | "breach";
export type DoubleCountRisk = "none" | "warning" | "blocked";
export type ViolationType =
  | "OVER_ATTRIBUTION"
  | "STANDARD_MIX"
  | "PERIOD_GAP"
  | "DOUBLE_COUNT";

export interface ApiSiteCert {
  standard: "ISCC PLUS" | "ISCC EU" | "GRS";
  certNo: string;
}

export interface ApiSite {
  id: string;
  name: string;
  cluster: "italy" | "china" | "vietnam";
  location: string;
  isccCertNo: string;
  balanceStandard: string;
  conversionFactor: number;
  lastAuditDate: string | null;
  nextAuditDate: string | null;
  certs: ApiSiteCert[];
  health: Health;
}

export interface ApiPeriod {
  id: string;
  label: string;
  startsOn: string;
  endsOn: string;
}

export interface ApiViolation {
  type: ViolationType;
  severity: "warning" | "breach";
  message: string;
  evidenceRef?: string;
  entryId?: string;
}

export interface ApiLedgerEntry {
  id: string;
  siteId: string;
  period: string;
  date: string;
  type: "input" | "output";
  evidenceRef: string;
  description: string;
  quantityKg: number;
  conversionFactor?: number;
  runningBalanceKg: number;
  doubleCountRisk: DoubleCountRisk;
  credited: boolean;
  note?: string;
}

export interface ApiLedger {
  site: {
    id: string;
    name: string;
    cluster: "italy" | "china" | "vietnam";
    isccCertNo: string;
    conversionFactor: number;
    health: Health;
  };
  period: { id: string; label: string };
  summary: {
    openingBalanceKg: number;
    creditedInputsKg: number;
    attributedOutputsKg: number;
    lossesKg: number;
    poolKg: number;
    closingBalanceKg: number;
    conversionFactor: number;
    health: Health;
  };
  entries: ApiLedgerEntry[];
  violations: ApiViolation[];
}

export interface ApiDashboard {
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
    cluster: "italy" | "china" | "vietnam";
    isccCertNo: string;
    currentPeriodLabel: string;
    poolKg: number;
    attributedKg: number;
    closingKg: number;
    health: Health;
  }>;
  activity: Array<{ id: string; at: string; kind: string; actor: string; message: string }>;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  sites: () => get<{ sites: ApiSite[] }>("/api/sites"),
  periods: (siteId: string) =>
    get<{ periods: ApiPeriod[] }>(`/api/periods?site=${encodeURIComponent(siteId)}`),
  ledger: (siteId: string, periodId: string) =>
    get<ApiLedger>(
      `/api/ledger?site=${encodeURIComponent(siteId)}&period=${encodeURIComponent(periodId)}`,
    ),
  dashboard: () => get<ApiDashboard>("/api/dashboard"),
};
