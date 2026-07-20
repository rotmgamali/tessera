import { describe, it, expect } from "vitest";
import {
  computeMassBalance,
  checkPeriodContinuity,
  type MassBalanceInput,
  type EngineEntry,
  type EnginePeriod,
} from "./massBalance";

const Q2: EnginePeriod = {
  id: "MB-2026-Q2",
  label: "MB-2026-Q2",
  startsOn: "2026-04-01",
  endsOn: "2026-06-30",
};
const Q1: EnginePeriod = {
  id: "MB-2026-Q1",
  label: "MB-2026-Q1",
  startsOn: "2026-01-01",
  endsOn: "2026-03-31",
};

function base(entries: EngineEntry[], overrides: Partial<MassBalanceInput> = {}): MassBalanceInput {
  return {
    siteId: "site-test",
    balanceStandard: "ISCC PLUS",
    siteCerts: [{ standard: "ISCC PLUS", certNo: "ISCC-PLUS-TEST" }],
    conversionFactor: 0.8,
    openingBalanceKg: 0,
    period: Q2,
    entries,
    ...overrides,
  };
}

const input = (id: string, quantityKg: number, extra: Partial<EngineEntry> = {}): EngineEntry => ({
  id,
  type: "input",
  date: "2026-04-10",
  evidenceRef: `TC-${id}`,
  description: `input ${id}`,
  quantityKg,
  conversionFactor: 0.8,
  standard: "ISCC PLUS",
  ...extra,
});

const output = (id: string, quantityKg: number, extra: Partial<EngineEntry> = {}): EngineEntry => ({
  id,
  type: "output",
  date: "2026-05-10",
  evidenceRef: `ATTR-${id}`,
  description: `output ${id}`,
  quantityKg,
  conversionFactor: 0.8,
  ...extra,
});

describe("mass-balance engine — happy path", () => {
  it("computes a clean, healthy balance with conversion-factor losses", () => {
    // 10,000 kg certified input @ 0.8 → 8,000 kg pool, 2,000 kg loss.
    const r = computeMassBalance(base([input("a", 10_000), output("b", 5_000)]));
    expect(r.creditedInputsKg).toBe(10_000);
    expect(r.lossesKg).toBe(2_000); // 10,000 × (1 − 0.8)
    expect(r.poolKg).toBe(8_000); // 10,000 × 0.8
    expect(r.attributedOutputsKg).toBe(5_000);
    expect(r.closingBalanceKg).toBe(3_000); // 8,000 − 5,000
    expect(r.health).toBe("healthy");
    expect(r.violations).toHaveLength(0);
  });

  it("carries an opening balance in from the prior period", () => {
    const r = computeMassBalance(
      base([input("a", 1_000), output("b", 500)], { openingBalanceKg: 2_000 }),
    );
    expect(r.poolKg).toBe(2_800); // 2,000 opening + 1,000 × 0.8
    expect(r.closingBalanceKg).toBe(2_300);
    expect(r.health).toBe("healthy");
  });

  it("keeps site balances independent (engine only ever sees one site's entries)", () => {
    const r = computeMassBalance(base([input("a", 500)]));
    expect(r.siteId).toBe("site-test");
    expect(r.creditedInputsKg).toBe(500);
  });
});

describe("rule 3 — conversion / consumption factor loss accounting", () => {
  it("caps attributable output at input × cf and honours per-entry factors", () => {
    const r = computeMassBalance(
      base([
        input("a", 1_000, { conversionFactor: 0.9 }), // pool +900, loss 100
        input("b", 1_000, { conversionFactor: 0.5 }), // pool +500, loss 500
      ]),
    );
    expect(r.poolKg).toBe(1_400);
    expect(r.lossesKg).toBe(600);
  });
});

describe("rule 4 — over-attribution breach", () => {
  it("flags OVER_ATTRIBUTION when attributed output exceeds the pool", () => {
    // Tây Ninh scenario: 18,400 kg in @ 0.77 = 14,168 pool; 21,050 attributed.
    const r = computeMassBalance(
      base([input("a", 18_400, { conversionFactor: 0.77 }), output("b", 21_050)], {
        conversionFactor: 0.77,
      }),
    );
    expect(r.closingBalanceKg).toBeCloseTo(-6_882, 0);
    expect(r.health).toBe("breach");
    const v = r.violations.find((x) => x.type === "OVER_ATTRIBUTION");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("breach");
    // The offending output row is marked blocked once the pool goes negative.
    const out = r.entries.find((e) => e.type === "output")!;
    expect(out.doubleCountRisk).toBe("blocked");
  });

  it("does not flag over-attribution when output stays within the pool", () => {
    const r = computeMassBalance(base([input("a", 10_000), output("b", 7_000)]));
    expect(r.violations.find((x) => x.type === "OVER_ATTRIBUTION")).toBeUndefined();
    expect(r.health).toBe("healthy");
  });
});

describe("rule 5a — standard mix (GRS / ISCC EU into an ISCC PLUS balance)", () => {
  it("blocks GRS material from an ISCC PLUS balance and keeps the balance valid", () => {
    // Wenzhou scenario: three ISCC PLUS inputs credited, one GRS input held out.
    const r = computeMassBalance(
      base(
        [
          input("a", 1_240, { conversionFactor: 0.79 }),
          input("b", 980, { conversionFactor: 0.79 }),
          input("c", 50_380, { conversionFactor: 0.79 }),
          input("grs", 540, {
            conversionFactor: 0.79,
            standard: "GRS",
            evidenceRef: "GRS-TC-CN-11902",
          }),
          output("d", 39_000),
        ],
        { conversionFactor: 0.79 },
      ),
    );
    expect(r.creditedInputsKg).toBe(52_600); // GRS 540 excluded
    expect(r.poolKg).toBeCloseTo(41_554, 0);
    expect(r.closingBalanceKg).toBeCloseTo(2_554, 0);
    const v = r.violations.find((x) => x.type === "STANDARD_MIX");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("warning");
    expect(v!.evidenceRef).toBe("GRS-TC-CN-11902");
    // Blocked GRS input carries a held-for-review flag, not credited.
    const grs = r.entries.find((e) => e.evidenceRef === "GRS-TC-CN-11902")!;
    expect(grs.credited).toBe(false);
    expect(grs.doubleCountRisk).toBe("warning");
    // Balance is valid ⇒ health is "watch", not "breach".
    expect(r.health).toBe("watch");
  });

  it("also blocks ISCC EU material from an ISCC PLUS balance", () => {
    const r = computeMassBalance(
      base([input("a", 1_000, { standard: "ISCC EU", evidenceRef: "EU-1" })]),
    );
    expect(r.creditedInputsKg).toBe(0);
    expect(r.violations.some((x) => x.type === "STANDARD_MIX")).toBe(true);
  });
});

describe("rule 5b — double-count prevention", () => {
  it("blocks a certified input booked twice under the same evidence ref", () => {
    const r = computeMassBalance(
      base([
        input("a", 1_000, { evidenceRef: "TC-DUP" }),
        input("b", 1_000, { evidenceRef: "TC-DUP" }),
      ]),
    );
    expect(r.creditedInputsKg).toBe(1_000); // second booking rejected
    const v = r.violations.find((x) => x.type === "DOUBLE_COUNT");
    expect(v).toBeDefined();
    expect(v!.severity).toBe("breach");
    expect(r.health).toBe("breach");
  });

  it("calls out the dual-certificate case when the site holds both ISCC certs", () => {
    const r = computeMassBalance(
      base(
        [
          input("a", 1_000, { evidenceRef: "TC-SHARED" }),
          input("b", 1_000, { evidenceRef: "TC-SHARED" }),
        ],
        {
          siteCerts: [
            { standard: "ISCC PLUS", certNo: "ISCC-PLUS-X" },
            { standard: "ISCC EU", certNo: "ISCC-EU-X" },
          ],
        },
      ),
    );
    const v = r.violations.find((x) => x.type === "DOUBLE_COUNT")!;
    expect(v.message).toContain("both ISCC EU and ISCC PLUS");
  });
});

describe("rule 2 — continuous mass-balance periods", () => {
  it("passes for strictly contiguous periods", () => {
    expect(checkPeriodContinuity([Q1, Q2])).toHaveLength(0);
  });

  it("flags a gap between periods", () => {
    const gapped: EnginePeriod = { ...Q2, startsOn: "2026-05-01" };
    const v = checkPeriodContinuity([Q1, gapped]);
    expect(v).toHaveLength(1);
    expect(v[0].type).toBe("PERIOD_GAP");
    expect(v[0].message).toContain("gap");
  });

  it("flags an overlap between periods", () => {
    const overlap: EnginePeriod = { ...Q1, endsOn: "2026-04-15" };
    const v = checkPeriodContinuity([overlap, Q2]);
    expect(v).toHaveLength(1);
    expect(v[0].message).toContain("overlap");
  });

  it("surfaces a period gap through computeMassBalance", () => {
    const gapped: EnginePeriod = { ...Q2, startsOn: "2026-05-01" };
    const r = computeMassBalance(
      base([input("a", 1_000)], { period: gapped, sitePeriods: [Q1, gapped] }),
    );
    expect(r.violations.some((v) => v.type === "PERIOD_GAP")).toBe(true);
    expect(r.health).toBe("watch");
  });
});
