export * from "./types";
export * from "./sites";
export * from "./parties";
export * from "./certificates";
export * from "./ledger";
export * from "./lots";
export * from "./packs";
export * from "./provenance";
export * from "./activity";

// ── Portfolio-level KPIs derived from fixtures (for the Dashboard) ────
import { sites } from "./sites";
import { certificates, certCounts } from "./certificates";
import { parties } from "./parties";

const round1 = (n: number) => Math.round(n * 10) / 10;

export const kpis = {
  certsInFlight: certificates.filter((c) => c.status !== "verified").length,
  totalCerts: certificates.length,
  pendingReviews: certCounts.needsReview + certCounts.flagged,
  verifiedTonnes: round1(
    parties
      .filter((p) => p.kind === "supplier")
      .reduce((s, p) => s + p.verifiedTonnes, 0),
  ),
  sitesHealthy: sites.filter((s) => s.health === "healthy").length,
  sitesWatch: sites.filter((s) => s.health === "watch").length,
  sitesBreach: sites.filter((s) => s.health === "breach").length,
  sitesTotal: sites.length,
};
