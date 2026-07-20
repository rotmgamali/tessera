# Tessera

**Verified-provenance & claims-substantiation system-of-record for fragmented pre-industrial recycled feedstock.**

Software-only: Tessera orchestrates, certifies, traces, matches, proves, and reports. It never
collects, owns, warehouses, or physically handles material. It digitizes the spreadsheet-and-PDF
transaction-certificate layer, runs ISCC PLUS / GRS mass-balance bookkeeping, prevents
double-counting of recycled credits, stitches sub-MOQ offcut volumes into certified
container-scale lots, and exports audit-ready EmpCo / PPWR / DPP substantiation packs.

Beachhead: ISCC PLUS-certified premium-eyewear cellulose-acetate converters in the
Eastman / Mazzucchelli "Acetate Renew" mass-balance buy-back ecosystem
(Belluno/Cadore · Wenzhou · Tay Ninh/HCMC).

## Wave 1 — this build

Clickable, navigable **UI only, with hardcoded fixture data**. No backend, no database, no real
AI/PDF extraction, no auth. It reuses the "Web4OS" design system (dark surfaces, gold accent).

### Routes

| Route | Screen |
|-------|--------|
| `/` | Dashboard — KPIs, regulatory countdowns, per-site mass-balance health, activity feed |
| `/certificates` | Certificate Inbox — queue + side-by-side source-PDF vs extracted ISCC fields |
| `/ledger` | Mass-Balance Ledger — site/period selector, running balance, double-counting warnings, Auditor view toggle |
| `/aggregation` | Lot Aggregation — the "mosaic": sub-MOQ offcuts stitched into certified lots with spec-matching |
| `/substantiation` | Substantiation & Export — pack builder with human-in-the-loop sign-off + DPP export |
| `/provenance` | Provenance Graph — two-sided verified-transaction network (custom SVG) |

All fixtures live in `src/fixtures/` (well-typed, shared across screens).

## Stack

Vite · React 18 · TypeScript · Tailwind CSS · react-router-dom v6 · lucide-react. Node 20+.

## Develop

```bash
npm install
npm run dev        # Vite dev server on :5173
npm run build      # tsc && vite build  → dist/
npm start          # serve -s dist -l $PORT   (production static serve)
```

## Deploy (Railway)

`railway.json` / `nixpacks.toml` build with `npm run build` and start with `npm start`, which
serves the static `dist/` on Railway's `$PORT`.
