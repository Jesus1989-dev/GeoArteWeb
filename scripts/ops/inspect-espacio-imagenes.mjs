import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log("NO_CREDENTIALS");
  process.exit(0);
}

const sb = createClient(url, key);

const { data: sample, error: sampleErr } = await sb
  .from("espacios_culturales")
  .select("*")
  .limit(1);

if (sampleErr) {
  console.log("SAMPLE_ERR", sampleErr.message);
  process.exit(1);
}

if (!sample?.[0]) {
  console.log("NO_ROWS");
  process.exit(0);
}

const cols = Object.keys(sample[0]).sort();
console.log("COLUMNS", cols.join(", "));

const imgCols = cols.filter((c) =>
  /imagen|foto|image|url|archivo|ruta|storage|path/i.test(c),
);
console.log("IMAGE_LIKE_COLS", imgCols.join(", ") || "(none)");

for (const c of imgCols) {
  const val = sample[0][c];
  console.log(`SAMPLE_${c}`, val == null ? "(null)" : String(val).slice(0, 160));
}

for (const col of imgCols) {
  const { count, error } = await sb
    .from("espacios_culturales")
    .select("*", { count: "exact", head: true })
    .not(col, "is", null)
    .neq(col, "");
  console.log(`COUNT_${col}`, error ? error.message : count);
}

const { data: buckets, error: bErr } = await sb.storage.listBuckets();
if (bErr) console.log("BUCKETS_ERR", bErr.message);
else console.log("BUCKETS", buckets?.map((b) => b.name).join(", ") || "(empty)");

for (const bucket of buckets ?? []) {
  const { data: files, error: fErr } = await sb.storage
    .from(bucket.name)
    .list("", { limit: 8 });
  const names = files?.map((f) => f.name).join(", ") || "(empty)";
  console.log(`BUCKET_${bucket.name}`, fErr ? fErr.message : names);
}
