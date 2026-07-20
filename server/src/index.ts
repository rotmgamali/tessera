import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { migrate } from "./migrate.js";
import { seedIfEmpty } from "./seed.js";
import { api } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Compiled server lives in server-dist/; the built SPA lives in dist/ next to it.
const DIST = path.resolve(__dirname, "..", "dist");

async function main() {
  // Hard rule: migrations + idempotent seed run automatically on every boot.
  await migrate();
  const seeded = await seedIfEmpty();
  console.log(`[tessera] migrations applied; seed ${seeded ? "inserted" : "skipped (data present)"}`);

  const app = express();
  app.use(express.json());

  // API first — same origin as the SPA, so the frontend uses relative /api/*.
  app.use("/api", api);

  // Static SPA assets.
  const hasDist = fs.existsSync(path.join(DIST, "index.html"));
  if (hasDist) {
    app.use(express.static(DIST));
    // SPA fallback: any non-API GET returns index.html so deep links 200.
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== "GET" || req.path.startsWith("/api")) return next();
      res.sendFile(path.join(DIST, "index.html"));
    });
  } else {
    console.warn(`[tessera] no built SPA at ${DIST} (run "npm run build"); serving API only.`);
  }

  // Error handler — never leak stack traces to the client.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[tessera] unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`[tessera] listening on :${port}`));
}

main().catch((err) => {
  console.error("[tessera] fatal boot error:", err);
  process.exit(1);
});
