/**
 * Localiza y corrige el espacio sin coordenadas (discrepancia 2918 vs 2917).
 * Uso: node scripts/ops/fix-espacio-sin-coords.mjs [--apply]
 */
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

const CENTROIDS = {
  "álvaro obregón": [19.3667, -99.2],
  azcapotzalco: [19.4867, -99.1867],
  "benito juárez": [19.3728, -99.1578],
  coyoacán: [19.3467, -99.1617],
  "cuajimalpa de morelos": [19.355, -99.3017],
  cuajimalpa: [19.355, -99.3017],
  cuauhtémoc: [19.4326, -99.1332],
  "gustavo a. madero": [19.4847, -99.1108],
  iztacalco: [19.3953, -99.0975],
  iztapalapa: [19.3575, -99.0733],
  "la magdalena contreras": [19.3092, -99.2117],
  "miguel hidalgo": [19.4167, -99.2],
  "milpa alta": [19.1925, -99.0233],
  tláhuac: [19.2833, -99.005],
  tlalpan: [19.2833, -99.1667],
  "venustiano carranza": [19.4428, -99.105],
  xochimilco: [19.2575, -99.1033],
};

function normAlcaldia(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveCentroid(alcaldia) {
  const key = normAlcaldia(alcaldia);
  if (CENTROIDS[key]) return CENTROIDS[key];
  const partial = Object.entries(CENTROIDS).find(
    ([k]) => key.includes(k) || k.includes(key),
  );
  return partial ? partial[1] : [19.4326, -99.1332];
}

function resolveCoords(row) {
  const dir = normAlcaldia(row.direccion ?? "");
  const nombre = normAlcaldia(row.nombre ?? "");

  // Centro Comercial Toreo / Lomas de Sotelo (Miguel Hidalgo)
  if (dir.includes("toreo") || dir.includes("lomas de sotelo") || nombre.includes("toreo")) {
    return [19.4589, -99.2157];
  }

  return resolveCentroid(row.alcaldia);
}

loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error("Faltan credenciales Supabase en .env.local");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: sinCoords, error } = await client
    .from("espacios_culturales")
    .select("id, nombre, alcaldia, direccion, latitud, longitud, tipo")
    .or("latitud.is.null,longitud.is.null");

  if (error) throw new Error(error.message);

  if (!sinCoords?.length) {
    console.log("No hay espacios sin coordenadas.");
    return;
  }

  console.log(`Espacios sin coordenadas: ${sinCoords.length}\n`);
  for (const row of sinCoords) {
    const [lat, lng] = resolveCoords(row);
    console.log(`ID:       ${row.id}`);
    console.log(`Nombre:   ${row.nombre}`);
    console.log(`Alcaldía: ${row.alcaldia ?? "(vacía)"}`);
    console.log(`Dirección:${row.direccion ?? "(vacía)"}`);
    console.log(`Propuesta: lat=${lat}, lng=${lng}\n`);

    if (!apply) continue;

    const { error: updErr } = await client
      .from("espacios_culturales")
      .update({ latitud: lat, longitud: lng })
      .eq("id", row.id);

    if (updErr) throw new Error(`Update ${row.id}: ${updErr.message}`);
    console.log(`  ✓ Coordenadas asignadas a ${row.id}`);
  }

  if (!apply) {
    console.log("Modo lectura. Ejecuta con --apply para guardar y luego npm run sync:mapa");
    return;
  }

  const { error: syncErr } = await client.rpc("sync_metricas_alcaldia", {
    p_anio: new Date().getFullYear(),
  });
  if (syncErr) {
    console.warn("sync_metricas_alcaldia:", syncErr.message);
    console.warn("Ejecuta manualmente: npm run sync:mapa");
  } else {
    console.log("✓ metricas_alcaldia sincronizadas");
  }

  const { count } = await client
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true });
  const { data: metricas } = await client
    .from("metricas_alcaldia")
    .select("cantidad_espacios")
    .eq("anio", new Date().getFullYear());
  const sumRecintos = (metricas ?? []).reduce((s, m) => s + (m.cantidad_espacios ?? 0), 0);
  console.log(`\nVerificación: padrón=${count}, recintos métricas=${sumRecintos}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
