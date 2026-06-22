import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", "..", ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

async function runSqlFile(client, relativePath) {
  const fullPath = path.join(__dirname, "..", "..", relativePath);
  const sql = fs.readFileSync(fullPath, "utf8");
  await client.query(sql);
  console.log("OK:", relativePath);
}

async function main() {
  const connectionString = env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.error("DATABASE_URL no está definida en .env");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await runSqlFile(client, "supabase/migrations/20260529_fuentes_informacion.sql");
  await runSqlFile(client, "supabase/seed-fuentes-informacion.sql");

  const { rows } = await client.query(
    "select count(*)::int as total from public.fuentes_informacion where activo = true",
  );
  console.log("fuentes_informacion activas:", rows[0]?.total ?? 0);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
