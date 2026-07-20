// ─────────────────────────────────────────────────────────────────────
// Tessera mass-balance rules engine — ISCC PLUS 203-2 Chain of Custody
//
// This module is PURE: it performs no I/O and touches no database. The API
// layer loads rows, maps them to the engine's input types, and calls
// `computeMassBalance`. This makes every rule directly unit-testable.
//
// Domain model (all quantities in kilograms):
//   • A mass balance is kept per SITE per continuous PERIOD, in the site's
//     balance standard (ISCC PLUS for the acetate wedge). Credits never flow
//     between sites (rule 1).
//   • Certified INPUT creates credits. Under a conversion/consumption factor
//     `cf` (yield), certified input × cf is the maximum certified output that
//     can be attributed; the (1 − cf) share is process LOSS and reduces the
//     credit pool (rule 3). We therefore hold the pool in OUTPUT-EQUIVALENT
//     kilograms: each credited input contributes `quantityKg × cf`.
//   • Attributed OUTPUT draws the pool down by its output kilograms. You
//     cannot attribute more certified output than the pool holds; doing so is
//     an OVER_ATTRIBUTION breach (rule 4).
//   • An input booked under a different standard than the site's balance
//     (e.g. GRS or ISCC EU material into an ISCC PLUS balance) is a
//     STANDARD_MIX event — it is BLOCKED from the pool, never silently
//     credited (rule 5).
//   • The same certified input (same evidence reference) may be credited only
//     once; a repeat is a DOUBLE_COUNT and is blocked. The dual-certificate
//     case (a site holding both ISCC EU and ISCC PLUS certificates claiming
//     the same volume under both) surfaces here as the same evidence reference
//     appearing under two standards (rule 5).
//   • Periods for a site must be contiguous with no gaps or overlaps; a break
//     is a PERIOD_GAP (rule 2).
// ─────────────────────────────────────────────────────────────────────

export type Standard = "ISCC PLUS" | "ISCC EU" | "GRS";

export type ViolationType =
  | "OVER_ATTRIBUTION"
  | "STANDARD_MIX"
  | "PERIOD_GAP"
  | "DOUBLE_COUNT";

export type Severity = "warning" | "breach";

/** Health rolls up the violations: a corrupted balance is a breach; a risk
 *  that a control successfully caught and contained is a watch. */
export type Health = "healthy" | "watch" | "breach";

export type DoubleCountRisk = "none" | "warning" | "blocked";

export interface SiteCert {
  standard: Standard;
  certNo: string;
}

export interface EngineEntry {
  id: string;
  type: "input" | "output";
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Linked certificate / attribution reference — the audit evidence. */
  evidenceRef: string;
  description: string;
  /** Raw kilograms: certified feedstock in (input) or attributed out (output). */
  quantityKg: number;
  /** Conversion / consumption factor (yield) applied to this movement. */
  conversionFactor: number;
  /** For inputs: the standard the incoming credit is certified under. */
  standard?: Standard;
  note?: string;
}

export interface EnginePeriod {
  id: string;
  label: string;
  /** ISO date (YYYY-MM-DD) inclusive start. */
  startsOn: string;
  /** ISO date (YYYY-MM-DD) inclusive end. */
  endsOn: string;
}

export interface MassBalanceInput {
  siteId: string;
  /** The standard this site's mass balance is kept under. */
  balanceStandard: Standard;
  /** Certificates the site holds (used for the dual-cert double-count check). */
  siteCerts: SiteCert[];
  /** Default site conversion factor (used when an entry omits its own). */
  conversionFactor: number;
  /** Opening balance carried in from the prior period's closing (output-equiv kg). */
  openingBalanceKg: number;
  period: EnginePeriod;
  entries: EngineEntry[];
  /** Optional: the site's full ordered period list, for continuity checking. */
  sitePeriods?: EnginePeriod[];
}

export interface Violation {
  type: ViolationType;
  severity: Severity;
  message: string;
  evidenceRef?: string;
  entryId?: string;
}

export interface ComputedEntry extends EngineEntry {
  /** Whether this input was credited to the pool (false when blocked). */
  credited: boolean;
  /** Pool balance (output-equivalent kg) immediately after this movement. */
  runningBalanceKg: number;
  /** How the double-counting / standard controls classified this row. */
  doubleCountRisk: DoubleCountRisk;
}

export interface MassBalanceResult {
  siteId: string;
  periodId: string;
  balanceStandard: Standard;
  openingBalanceKg: number;
  /** Σ of credited raw input kilograms. */
  creditedInputsKg: number;
  conversionFactor: number;
  /** Σ of credited input × (1 − cf) — process loss. */
  lossesKg: number;
  /** opening + Σ credited input × cf — max certified output available. */
  poolKg: number;
  /** Σ of attributed output kilograms. */
  attributedOutputsKg: number;
  /** poolKg − attributedOutputsKg. Negative ⇒ over-attribution. */
  closingBalanceKg: number;
  health: Health;
  entries: ComputedEntry[];
  violations: Violation[];
}

const round = (n: number): number => Math.round(n * 1000) / 1000;
const kg = (n: number): string => `${Math.round(n).toLocaleString("en-US")} kg`;

const ONE_DAY_MS = 86_400_000;
const dayDiff = (a: string, b: string): number =>
  Math.round(
    (Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / ONE_DAY_MS,
  );

/**
 * Rule 2 — period continuity. Given a site's ordered periods, flag any gap
 * (a break between one period's end and the next period's start) or overlap.
 * Returns violations relevant up to and including `throughPeriodId` if given,
 * otherwise across all supplied periods.
 */
export function checkPeriodContinuity(
  periods: EnginePeriod[],
  throughPeriodId?: string,
): Violation[] {
  const sorted = [...periods].sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  const violations: Violation[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const gap = dayDiff(prev.endsOn, cur.startsOn); // days between end and next start
    if (gap > 1) {
      violations.push({
        type: "PERIOD_GAP",
        severity: "warning",
        message: `Mass-balance period gap: ${gap - 1} day(s) uncovered between ${prev.label} (ends ${prev.endsOn}) and ${cur.label} (starts ${cur.startsOn}). ISCC PLUS 203-2 requires continuous periods with no gaps.`,
      });
    } else if (gap < 1) {
      violations.push({
        type: "PERIOD_GAP",
        severity: "warning",
        message: `Mass-balance period overlap: ${cur.label} (starts ${cur.startsOn}) overlaps ${prev.label} (ends ${prev.endsOn}). Periods must be strictly contiguous.`,
      });
    }
  }
  if (throughPeriodId) {
    // Only report continuity issues at or before the requested period.
    const idx = sorted.findIndex((p) => p.id === throughPeriodId);
    if (idx <= 0) return [];
  }
  return violations;
}

/**
 * Rules 1, 3, 4, 5 — compute a site+period mass balance and its violations.
 * Pure function: same input always yields the same result.
 */
export function computeMassBalance(input: MassBalanceInput): MassBalanceResult {
  const {
    siteId,
    balanceStandard,
    siteCerts,
    conversionFactor: siteCf,
    openingBalanceKg,
    period,
    entries,
  } = input;

  const violations: Violation[] = [];
  const computed: ComputedEntry[] = [];

  const holdsBothIsccCerts =
    siteCerts.some((c) => c.standard === "ISCC PLUS") &&
    siteCerts.some((c) => c.standard === "ISCC EU");

  // Process entries in chronological order so the running balance is honest.
  const ordered = [...entries].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });

  const seenInputRefs = new Set<string>();
  let running = openingBalanceKg;
  let creditedInputsKg = 0;
  let lossesKg = 0;
  let attributedOutputsKg = 0;

  for (const e of ordered) {
    const cf = e.conversionFactor || siteCf;
    let credited = false;
    let doubleCountRisk: DoubleCountRisk = "none";

    if (e.type === "input") {
      const entryStandard = e.standard ?? balanceStandard;

      // Rule 5a — standard mix. An input certified under a different standard
      // than the site's balance cannot be booked; it is held out of the pool.
      const standardMismatch = entryStandard !== balanceStandard;

      // Rule 5b — double counting. The same evidence reference may only be
      // credited once. When a site holds both ISCC EU and ISCC PLUS certs,
      // the same volume re-appearing under the other standard lands here too.
      const duplicate = seenInputRefs.has(e.evidenceRef);

      if (standardMismatch) {
        doubleCountRisk = "warning";
        violations.push({
          type: "STANDARD_MIX",
          severity: "warning",
          message: `${e.evidenceRef}: ${entryStandard} material cannot be booked into a ${balanceStandard} mass balance — held out of attribution to prevent double-counting across standards.`,
          evidenceRef: e.evidenceRef,
          entryId: e.id,
        });
      } else if (duplicate) {
        doubleCountRisk = "blocked";
        violations.push({
          type: "DOUBLE_COUNT",
          severity: "breach",
          message: `${e.evidenceRef}: certified input already credited in this balance — blocked to prevent double-counting${holdsBothIsccCerts ? " (site holds both ISCC EU and ISCC PLUS certificates; the same volume must not be claimed under both)" : ""}.`,
          evidenceRef: e.evidenceRef,
          entryId: e.id,
        });
      } else {
        credited = true;
        seenInputRefs.add(e.evidenceRef);
        const contribution = e.quantityKg * cf;
        creditedInputsKg += e.quantityKg;
        lossesKg += e.quantityKg * (1 - cf);
        running += contribution;
      }
    } else {
      // Output attribution draws the pool down by the attributed output kg.
      attributedOutputsKg += e.quantityKg;
      running -= e.quantityKg;
      if (running < 0) {
        doubleCountRisk = "blocked";
      }
    }

    computed.push({
      ...e,
      credited,
      runningBalanceKg: round(running),
      doubleCountRisk,
    });
  }

  // Pool = opening balance + Σ (credited input × its conversion factor).
  const finalPoolKg = round(
    openingBalanceKg + sumCreditedContribution(computed, siteCf),
  );
  const closingBalanceKg = round(finalPoolKg - attributedOutputsKg);

  // Rule 4 — over-attribution. If more certified output was attributed than
  // the pool holds, the balance is corrupted: a reportable breach.
  if (closingBalanceKg < 0) {
    violations.push({
      type: "OVER_ATTRIBUTION",
      severity: "breach",
      message: `Attributed certified output (${kg(attributedOutputsKg)}) exceeds the available credit pool (${kg(finalPoolKg)}) for ${period.label}. Closing balance ${kg(closingBalanceKg)} — an ISCC PLUS 203-2 over-attribution breach. Correct before assembling any substantiation pack.`,
    });
  }

  // Rule 2 — surface any period continuity issue for this site.
  if (input.sitePeriods && input.sitePeriods.length > 1) {
    violations.push(...checkPeriodContinuity(input.sitePeriods, period.id));
  }

  const health: Health = violations.some((v) => v.severity === "breach")
    ? "breach"
    : violations.length > 0
      ? "watch"
      : "healthy";

  return {
    siteId,
    periodId: period.id,
    balanceStandard,
    openingBalanceKg: round(openingBalanceKg),
    creditedInputsKg: round(creditedInputsKg),
    conversionFactor: siteCf,
    lossesKg: round(lossesKg),
    poolKg: finalPoolKg,
    attributedOutputsKg: round(attributedOutputsKg),
    closingBalanceKg,
    health,
    entries: computed,
    violations,
  };
}

function sumCreditedContribution(entries: ComputedEntry[], siteCf: number): number {
  return entries
    .filter((e) => e.type === "input" && e.credited)
    .reduce((s, e) => s + e.quantityKg * (e.conversionFactor || siteCf), 0);
}
