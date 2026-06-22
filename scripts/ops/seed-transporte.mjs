/**
 * Carga trazos de transporte masivo en Supabase (PostGIS) desde GeoJSON empaquetado.
 *
 * Fuentes:
 *   src/data/geo/cdmx-metro-lineas.geojson
 *   src/data/geo/cdmx-metrobus-lineas.geojson
 *
 * Uso: npm run seed:transporte
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

function normalizeColor(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "#334155";
  if (raw.startsWith("#")) return raw;
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw}`;
  return "#334155";
}

function metroLineId(linea) {
  const key = String(linea).trim().toUpperCase();
  if (key === "A") return "la";
  if (key === "B") return "lb";
  return `l${key.toLowerCase()}`;
}

function metrobusLineId(linea, index) {
  const num = Number.parseInt(String(linea).trim(), 10);
  const base = Number.isFinite(num) ? `mb${String(num).padStart(2, "0")}` : "mb00";
  return `${base}-${String(index).padStart(2, "0")}`;
}

function readCollection(filename) {
  const filePath = join(process.cwd(), "src/data/geo", filename);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/** PostGIS 2D: elimina Z/M de coordenadas GeoJSON. */
function force2dGeometry(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) return geometry;

  const dropZM = (coord) => {
    if (!Array.isArray(coord)) return coord;
    if (typeof coord[0] === "number") return [coord[0], coord[1]];
    return coord.map(dropZM);
  };

  return {
    ...geometry,
    coordinates: dropZM(geometry.coordinates),
  };
}

function force2dFeature(feature) {
  return {
    ...feature,
    geometry: force2dGeometry(feature.geometry),
  };
}

loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = [];

for (const feature of readCollection("cdmx-metro-lineas.geojson").features ?? []) {
  const linea = String(feature.properties?.LINEA ?? "").trim();
  const ruta = String(feature.properties?.RUTA ?? "").trim();
  if (!linea) continue;
  rows.push({
    id: metroLineId(linea),
    nombre: ruta || `Línea ${linea}`,
    sistema: "metro",
    color: normalizeColor(feature.properties?.color),
    feature: force2dFeature(feature),
  });
}

const metrobusCounters = new Map();
for (const feature of readCollection("cdmx-metrobus-lineas.geojson").features ?? []) {
  const linea = String(feature.properties?.LINEA ?? "").trim();
  const ruta = String(feature.properties?.RUTA ?? "Metrobús").trim();
  if (!linea) continue;
  const num = Number.parseInt(linea, 10);
  const base = Number.isFinite(num) ? `mb${String(num).padStart(2, "0")}` : "mb00";
  const index = metrobusCounters.get(base) ?? 0;
  metrobusCounters.set(base, index + 1);
  rows.push({
    id: metrobusLineId(linea, index),
    nombre: ruta,
    sistema: "metrobús",
    color: normalizeColor(feature.properties?.color),
    feature: force2dFeature(feature),
  });
}

let upserted = 0;

for (const row of rows) {
  const { error } = await supabase.rpc("upsert_transporte_desde_geojson", {
    p_id: row.id,
    p_nombre: row.nombre,
    p_sistema: row.sistema,
    p_color_hex: row.color,
    p_geojson: row.feature,
  });

  if (error) {
    console.error(`Error en ${row.nombre}:`, error.message);
    process.exit(1);
  }

  upserted += 1;
  console.log(`✓ ${row.id} · ${row.nombre}`);
}

console.log(`\nListo: ${upserted} trazos de transporte cargados.`);
