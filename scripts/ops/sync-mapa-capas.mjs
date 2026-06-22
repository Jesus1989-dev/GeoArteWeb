/**
 * Sincroniza métricas territoriales y macrozonas del mapa en Supabase.
 *
 * Uso: npm run sync:mapa
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
const anioRaw = process.env.NEXT_PUBLIC_ANIO_CORTE_METRICAS?.trim();
const anio = anioRaw ? Number(anioRaw) : new Date().getFullYear();

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function logSync(accion, filas, mensaje) {
  const { error } = await admin.from("mapa_sync_log").insert({
    accion,
    filas_afectadas: filas,
    mensaje,
  });
  if (error) {
    console.warn("[sync:mapa] log:", error.message);
  }
}

async function main() {
  console.log(`Sincronizando capas del mapa (año ${anio})…`);

  const { data: metricasRows, error: metricasError } = await admin.rpc(
    "sync_metricas_alcaldia",
    { p_anio: anio },
  );
  if (metricasError) {
    console.error("sync_metricas_alcaldia:", metricasError.message);
    process.exit(1);
  }
  const filasMetricas = Number(metricasRows) || 0;
  await logSync("metricas_alcaldia", filasMetricas, `${filasMetricas} alcaldías · año ${anio}`);
  console.log(`✓ Métricas: ${filasMetricas} filas`);

  const { data: macroRows, error: macroError } = await admin.rpc(
    "sync_macrozonas_desde_alcaldias",
  );
  if (macroError) {
    console.error("sync_macrozonas_desde_alcaldias:", macroError.message);
    process.exit(1);
  }
  const filasMacro = Number(macroRows) || 0;
  await logSync("macrozonas", filasMacro, `${filasMacro} macrozonas derivadas`);
  console.log(`✓ Macrozonas: ${filasMacro} filas`);

  console.log("Sincronización completada.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
