/**
 * Apply St. Rita's SQL migrations (srb_* tables) to Postgres.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npm run db:migrate
 *
 * Shared Signal Works production (optional guard):
 *   SRB_MIGRATE_CONFIRM=gezdzzqnylloaxcmuzvm DATABASE_URL=... npm run db:migrate
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvLocal();

const databaseUrl =
  process.env.DATABASE_URL?.trim() || process.env.SUPABASE_DB_URL?.trim();
if (!databaseUrl) {
  console.error(
    "Set DATABASE_URL (Supabase → Project Settings → Database → connection string).",
  );
  process.exit(1);
}

const projectRefMatch = databaseUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/i);
const projectRef = projectRefMatch?.[1] ?? null;
const confirm = process.env.SRB_MIGRATE_CONFIRM?.trim();
if (projectRef === "gezdzzqnylloaxcmuzvm" && confirm !== projectRef) {
  console.error(
    `This URL is shared production (${projectRef}). Re-run with SRB_MIGRATE_CONFIRM=${projectRef}.`,
  );
  process.exit(1);
}

const migrationsDir = resolve(process.cwd(), "supabase/migrations");
const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

async function main() {
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    for (const file of files) {
      const sql = readFileSync(resolve(migrationsDir, file), "utf8");
      console.log(`Applying ${file}…`);
      await client.query(sql);
      console.log(`  OK`);
    }
    console.log("Migrations complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
