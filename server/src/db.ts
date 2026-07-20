import pg from "pg";

const { Pool, types } = pg;

// Return DATE (OID 1082) columns as raw 'YYYY-MM-DD' strings, not JS Dates.
// The default Date parsing plus toISOString() would shift the day across the
// local timezone; keeping them as strings preserves the seeded calendar dates.
types.setTypeParser(1082, (v: string) => v);

/**
 * A single shared connection pool, configured from DATABASE_URL. In production
 * Railway provides DATABASE_URL; locally you can point it at any Postgres.
 * SSL is enabled for non-local hosts (Railway's proxy requires it) and can be
 * forced off with PGSSLMODE=disable.
 */
function resolveSsl(url: string): pg.PoolConfig["ssl"] {
  if (process.env.PGSSLMODE === "disable") return false;
  const isLocal = /@(localhost|127\.0\.0\.1|::1)[:/]/.test(url) || url.includes("host=/");
  if (isLocal) return false;
  return { rejectUnauthorized: false };
}

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Tessera's API needs a Postgres connection string. " +
        "In production Railway provides it; locally set DATABASE_URL (e.g. in a .env or your shell).",
    );
  }
  pool = new Pool({ connectionString: url, ssl: resolveSsl(url), max: 5 });
  return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params as never[]);
}
