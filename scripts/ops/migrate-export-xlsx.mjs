import fs from "fs";
import pg from "pg";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

async function main() {
  const client = new pg.Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const before = await client.query(
    "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'export_downloads_format_check'",
  );
  console.log("before:", before.rows[0]?.def ?? "(none)");

  await client.query(
    "ALTER TABLE export_downloads DROP CONSTRAINT IF EXISTS export_downloads_format_check",
  );
  await client.query(`
    ALTER TABLE export_downloads
    ADD CONSTRAINT export_downloads_format_check
    CHECK (format = ANY (ARRAY['PDF'::text, 'CSV'::text, 'XLSX'::text]))
  `);

  const after = await client.query(
    "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'export_downloads_format_check'",
  );
  console.log("after:", after.rows[0]?.def ?? "(none)");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
