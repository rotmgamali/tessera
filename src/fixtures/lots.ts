import type { SubMoqOffcut, CertifiedLot } from "./types";

// The "mosaic": many small sub-MOQ supplier offcut volumes stitched, in
// software, into certified container-scale lots — matched on grade / color /
// composition to a recycler/converter's technical spec. Tessera never takes
// title to or warehouses material.

export const offcuts: SubMoqOffcut[] = [
  { id: "oc-1", supplierId: "sup-ouhai", supplierName: "Ouhai Precision Eyewear Co.", cluster: "china", grade: "AR-Flake A", color: "Black gloss", composition: "≥62% bio-content", volumeKg: 1_240, recycledContentPct: 100, status: "verified", matchScore: 0.98 },
  { id: "oc-2", supplierId: "sup-lucheng", supplierName: "Lucheng Optical Parts", cluster: "china", grade: "AR-Flake A", color: "Havana", composition: "≥60% bio-content", volumeKg: 980, recycledContentPct: 100, status: "verified", matchScore: 0.94 },
  { id: "oc-3", supplierId: "sup-artigiana", supplierName: "Artigiana Occhiali s.r.l.", cluster: "italy", grade: "AR-Sheet B", color: "Honey/amber", composition: "≥60% bio-content", volumeKg: 860, recycledContentPct: 100, status: "verified", matchScore: 0.91 },
  { id: "oc-4", supplierId: "sup-dolomiti", supplierName: "Dolomiti Frame Works", cluster: "italy", grade: "AR-Flake A", color: "Dark tortoise", composition: "≥60% bio-content", volumeKg: 690, recycledContentPct: 100, status: "verified", matchScore: 0.88 },
  { id: "oc-5", supplierId: "sup-trangbang", supplierName: "Trảng Bàng Acetate Co-op", cluster: "vietnam", grade: "AR-Flake A", color: "Warm demi", composition: "≥60% bio-content", volumeKg: 610, recycledContentPct: 100, status: "verified", matchScore: 0.86 },
  { id: "oc-6", supplierId: "sup-ruian", supplierName: "Ruian Frame Offcuts", cluster: "china", grade: "AR-Flake A", color: "Assorted", composition: "unverified blend", volumeKg: 540, recycledContentPct: 100, status: "flagged", matchScore: 0.41 },
  { id: "oc-7", supplierId: "sup-cortina", supplierName: "Cortina Ottica Componenti", cluster: "italy", grade: "AR-Sheet B", color: "Crystal/clear", composition: "92% (mixed)", volumeKg: 310, recycledContentPct: 92, status: "pending", matchScore: 0.58 },
  { id: "oc-8", supplierId: "sup-binhduong", supplierName: "Bình Dương Optical Trim", cluster: "vietnam", grade: "AR-Flake A", color: "Smoke grey", composition: "unverified blend", volumeKg: 700, recycledContentPct: 100, status: "pending", matchScore: 0.63 },
];

export const lots: CertifiedLot[] = [
  {
    id: "lot-a",
    ref: "LOT-AR-2026-014",
    buyerId: "rec-eastman",
    buyerName: "Eastman Acetate Renew",
    specGrade: "AR-Flake A",
    specColor: "Dark / neutral tones",
    specComposition: "≥60% bio-content, ISCC PLUS",
    moqKg: 5_000,
    filledKg: 4_520,
    status: "filling",
    offcutIds: ["oc-1", "oc-2", "oc-4", "oc-5"],
  },
  {
    id: "lot-b",
    ref: "LOT-AR-2026-015",
    buyerId: "rec-mazzucchelli",
    buyerName: "Mazzucchelli 1849",
    specGrade: "AR-Sheet B",
    specColor: "Warm translucent",
    specComposition: "≥60% bio-content, ISCC PLUS",
    moqKg: 3_000,
    filledKg: 3_000,
    status: "spec-locked",
    offcutIds: ["oc-3"],
  },
];

export const offcutById = (id: string): SubMoqOffcut | undefined =>
  offcuts.find((o) => o.id === id);
