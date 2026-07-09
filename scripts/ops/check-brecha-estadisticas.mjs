/** Brecha en tabla estadisticas. Uso: node scripts/ops/check-brecha-estadisticas.mjs */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

const anio = Number(process.env.NEXT_PUBLIC_ANIO_CORTE_METRICAS) || 2026;

const { data, error } = await client
  .from("estadisticas")
  .select("titulo, categoria, valor, alcaldia_id, disciplina_nombre")
  .eq("anio", anio)
  .or("titulo.ilike.%brecha%,titulo.ilike.%cobertura%,categoria.ilike.%brecha%");

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log("Filas estadisticas brecha/cobertura:", data?.length ?? 0);
for (const row of data ?? []) {
  console.log(JSON.stringify(row));
}

const { data: alc } = await client.from("alcaldias").select("id, nombre");
const cuauhtId = alc?.find((a) => /cuauht/i.test(a.nombre))?.id;
console.log("\nCuauhtémoc id:", cuauhtId);

const cuauhtRows = (data ?? []).filter((r) => r.alcaldia_id === cuauhtId);
console.log("Filas para Cuauhtémoc:", cuauhtRows.length);
for (const row of cuauhtRows) console.log(JSON.stringify(row));
