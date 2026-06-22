/**
 * Carga polígonos de alcaldías CDMX en Supabase (PostGIS) y deriva macrozonas.
 *
 * Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * (en .env.local, .env o variables de entorno).
 *
 * Uso:
 *   npm run seed:territorio
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Añade SUPABASE_SERVICE_ROLE_KEY a .env.local (Dashboard → Settings → API).");
  process.exit(1);
}

const geoPath = join(process.cwd(), "src/data/geo/cdmx-alcaldias.geojson");
const source = JSON.parse(readFileSync(geoPath, "utf8"));

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let upserted = 0;

for (const feature of source.features ?? []) {
  const nombre = String(feature.properties?.NOM_MUN ?? "").trim();
  const codigo = String(feature.properties?.CVE_MUN ?? "").trim();
  if (!nombre || !codigo) continue;

  const { error } = await supabase.rpc("upsert_territorio_desde_geojson", {
    p_tipo: "alcaldia",
    p_codigo: codigo,
    p_nombre: nombre,
    p_geojson: feature,
  });

  if (error) {
    console.error(`Error en ${nombre}:`, error.message);
    process.exit(1);
  }

  upserted += 1;
  console.log(`✓ Alcaldía: ${nombre}`);
}

const { data: macroRows, error: macroError } = await supabase.rpc(
  "sync_macrozonas_desde_alcaldias",
);

if (macroError) {
  console.error("Error sync macrozonas:", macroError.message);
  process.exit(1);
}

console.log(`\nListo: ${upserted} alcaldías · ${macroRows ?? 0} macrozonas.`);
