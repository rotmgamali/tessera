import { query } from "./db.js";

/**
 * Idempotent schema migration, run on every server boot. Uses
 * CREATE TABLE IF NOT EXISTS so a redeploy against an existing database is a
 * no-op. This must never rely on a separate manual migrate step — production
 * has broken before when migrations did not auto-run on deploy.
 */
export async function migrate(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS sites (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      cluster           TEXT NOT NULL,
      location          TEXT NOT NULL,
      iscc_cert_no      TEXT NOT NULL,
      balance_standard  TEXT NOT NULL DEFAULT 'ISCC PLUS',
      conversion_factor DOUBLE PRECISION NOT NULL,
      last_audit_date   DATE,
      next_audit_date   DATE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS site_certificates (
      id        TEXT PRIMARY KEY,
      site_id   TEXT NOT NULL REFERENCES sites(id),
      standard  TEXT NOT NULL,
      cert_no   TEXT NOT NULL,
      valid_from DATE,
      valid_to   DATE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS mb_periods (
      id        TEXT NOT NULL,
      site_id   TEXT NOT NULL REFERENCES sites(id),
      label     TEXT NOT NULL,
      starts_on DATE NOT NULL,
      ends_on   DATE NOT NULL,
      PRIMARY KEY (site_id, id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id                TEXT PRIMARY KEY,
      site_id           TEXT NOT NULL REFERENCES sites(id),
      period_id         TEXT NOT NULL,
      entry_date        DATE NOT NULL,
      type              TEXT NOT NULL,
      evidence_ref      TEXT NOT NULL,
      description       TEXT NOT NULL,
      quantity_kg       DOUBLE PRECISION NOT NULL,
      conversion_factor DOUBLE PRECISION,
      standard          TEXT,
      note              TEXT
    );
  `);

  // Supporting tables that back the dashboard KPI tiles and activity feed.
  await query(`
    CREATE TABLE IF NOT EXISTS parties (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      kind           TEXT NOT NULL,
      verified_tonnes DOUBLE PRECISION NOT NULL DEFAULT 0
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id            TEXT PRIMARY KEY,
      ref           TEXT NOT NULL,
      status        TEXT NOT NULL,
      standard      TEXT NOT NULL,
      net_weight_kg DOUBLE PRECISION NOT NULL DEFAULT 0
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS activity (
      id      TEXT PRIMARY KEY,
      at      TIMESTAMPTZ NOT NULL,
      kind    TEXT NOT NULL,
      actor   TEXT NOT NULL,
      message TEXT NOT NULL
    );
  `);
}
