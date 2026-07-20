import type { Party } from "./types";

// Fragmented sub-MOQ offcut suppliers (small eyewear workshops), our own
// converter sites, the molecular recyclers / buy-back programs, and the
// downstream brands. Names are reused verbatim across every screen.

export const parties: Party[] = [
  // ── Suppliers — Belluno/Cadore cluster ──────────────────────────────
  {
    id: "sup-artigiana",
    name: "Artigiana Occhiali s.r.l.",
    kind: "supplier",
    cluster: "italy",
    location: "Calalzo di Cadore, Belluno, IT",
    iscCertified: true,
    verifiedTonnes: 3.4,
    material: "Acetate offcut, honey/amber sheet",
  },
  {
    id: "sup-dolomiti",
    name: "Dolomiti Frame Works",
    kind: "supplier",
    cluster: "italy",
    location: "Pieve di Cadore, Belluno, IT",
    iscCertified: true,
    verifiedTonnes: 2.1,
    material: "Acetate flake, mixed dark tortoise",
  },
  {
    id: "sup-cortina",
    name: "Cortina Ottica Componenti",
    kind: "supplier",
    cluster: "italy",
    location: "Cortina d'Ampezzo, Belluno, IT",
    iscCertified: false,
    verifiedTonnes: 0.9,
    material: "Acetate offcut, crystal/clear",
  },
  // ── Suppliers — Wenzhou cluster ─────────────────────────────────────
  {
    id: "sup-ouhai",
    name: "Ouhai Precision Eyewear Co.",
    kind: "supplier",
    cluster: "china",
    location: "Ouhai, Wenzhou, CN",
    iscCertified: true,
    verifiedTonnes: 5.7,
    material: "Acetate flake, black gloss",
  },
  {
    id: "sup-lucheng",
    name: "Lucheng Optical Parts",
    kind: "supplier",
    cluster: "china",
    location: "Lucheng, Wenzhou, CN",
    iscCertified: true,
    verifiedTonnes: 4.2,
    material: "Acetate sheet trim, havana",
  },
  {
    id: "sup-ruian",
    name: "Ruian Frame Offcuts",
    kind: "supplier",
    cluster: "china",
    location: "Ruian, Wenzhou, CN",
    iscCertified: false,
    verifiedTonnes: 1.3,
    material: "Acetate flake, assorted color",
  },
  // ── Suppliers — Tay Ninh / HCMC cluster ─────────────────────────────
  {
    id: "sup-trangbang",
    name: "Trảng Bàng Acetate Co-op",
    kind: "supplier",
    cluster: "vietnam",
    location: "Trảng Bàng, Tây Ninh, VN",
    iscCertified: true,
    verifiedTonnes: 2.8,
    material: "Acetate offcut, warm demi",
  },
  {
    id: "sup-binhduong",
    name: "Bình Dương Optical Trim",
    kind: "supplier",
    cluster: "vietnam",
    location: "Thuận An, Bình Dương, VN",
    iscCertified: false,
    verifiedTonnes: 0.7,
    material: "Acetate flake, smoke grey",
  },

  // ── Our own converter sites (as graph parties) ──────────────────────
  {
    id: "site-cadore",
    name: "Cadore Ottica — Domegge",
    kind: "converter",
    cluster: "italy",
    location: "Domegge di Cadore, IT",
    iscCertified: true,
    verifiedTonnes: 84.2,
  },
  {
    id: "site-wenzhou",
    name: "Cadore Ottica — Wenzhou",
    kind: "converter",
    cluster: "china",
    location: "Wenzhou, CN",
    iscCertified: true,
    verifiedTonnes: 52.6,
  },
  {
    id: "site-tayninh",
    name: "Cadore Ottica — Tây Ninh",
    kind: "converter",
    cluster: "vietnam",
    location: "Tây Ninh, VN",
    iscCertified: true,
    verifiedTonnes: 18.4,
  },

  // ── Recyclers / buy-back programs ───────────────────────────────────
  {
    id: "rec-eastman",
    name: "Eastman Acetate Renew",
    kind: "recycler",
    cluster: "italy",
    location: "Kingsport, US · via Mazzucchelli",
    iscCertified: true,
    verifiedTonnes: 96.5,
    material: "Molecular recycling — mass balance",
  },
  {
    id: "rec-mazzucchelli",
    name: "Mazzucchelli 1849",
    kind: "recycler",
    cluster: "italy",
    location: "Castiglione Olona, Varese, IT",
    iscCertified: true,
    verifiedTonnes: 71.3,
    material: "Acetate Renew flake & sheet converter",
  },

  // ── Downstream brands ───────────────────────────────────────────────
  {
    id: "brand-mykita",
    name: "Northlight Eyewear (brand)",
    kind: "brand",
    cluster: "italy",
    location: "Berlin, DE",
    iscCertified: true,
    verifiedTonnes: 41.0,
  },
  {
    id: "brand-andywolf",
    name: "Wolfram Optik (brand)",
    kind: "brand",
    cluster: "italy",
    location: "Hartberg, AT",
    iscCertified: true,
    verifiedTonnes: 28.6,
  },
];

export const partyById = (id: string): Party | undefined =>
  parties.find((p) => p.id === id);

export const suppliers = parties.filter((p) => p.kind === "supplier");
export const recyclers = parties.filter((p) => p.kind === "recycler");
export const brands = parties.filter((p) => p.kind === "brand");
