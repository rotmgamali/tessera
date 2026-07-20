import type { Site } from "./types";

// Our customer: Cadore Ottica S.p.A. — an ISCC PLUS-certified premium
// eyewear cellulose-acetate converter in the Eastman/Mazzucchelli
// "Acetate Renew" mass-balance buy-back ecosystem, with three sites
// across the Belluno/Cadore, Wenzhou, and Tay Ninh/HCMC clusters.

export const sites: Site[] = [
  {
    id: "site-cadore",
    name: "Cadore Ottica — Domegge di Cadore",
    cluster: "italy",
    location: "Domegge di Cadore, Belluno, Italy",
    iscCertNo: "ISCC-PLUS-IT-2024-0417",
    health: "healthy",
    currentPeriod: "MB-2026-Q2 (Apr–Jun 2026)",
    creditBalanceKg: 84_200,
    attributedKg: 61_940,
    conversionFactor: 0.82,
    lastAuditDate: "2026-03-11",
    nextAuditDate: "2027-03-10",
  },
  {
    id: "site-wenzhou",
    name: "Cadore Ottica — Wenzhou Plant",
    cluster: "china",
    location: "Ouhai District, Wenzhou, Zhejiang, China",
    iscCertNo: "ISCC-PLUS-CN-2024-1182",
    health: "watch",
    currentPeriod: "MB-2026-Q2 (Apr–Jun 2026)",
    creditBalanceKg: 52_600,
    attributedKg: 49_180,
    conversionFactor: 0.79,
    lastAuditDate: "2026-02-24",
    nextAuditDate: "2027-02-23",
  },
  {
    id: "site-tayninh",
    name: "Cadore Ottica — Tây Ninh Line",
    cluster: "vietnam",
    location: "Trảng Bàng, Tây Ninh, Vietnam",
    iscCertNo: "ISCC-PLUS-VN-2025-0356",
    health: "breach",
    currentPeriod: "MB-2026-Q2 (Apr–Jun 2026)",
    creditBalanceKg: 18_400,
    attributedKg: 21_050,
    conversionFactor: 0.77,
    lastAuditDate: "2026-05-06",
    nextAuditDate: "2027-05-05",
  },
];

export const siteById = (id: string): Site | undefined =>
  sites.find((s) => s.id === id);
