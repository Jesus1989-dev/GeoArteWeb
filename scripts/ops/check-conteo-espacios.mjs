/**
 * Compara conteos del padrón vs KPIs mostrados en la app.
 * Uso: node scripts/ops/check-conteo-espacios.mjs
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

loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error("Faltan credenciales Supabase en .env");
  process.exit(1);
}

const anio = Number(process.env.NEXT_PUBLIC_ANIO_CORTE_METRICAS) || 2026;
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const [
    rpcRes,
    statsRes,
    metricasRes,
    totalRes,
    georefRes,
    sinAlcaldiaRes,
    fueraCdmxRes,
  ] = await Promise.all([
    client.rpc("obtener_estadisticas_alcaldias"),
    client
      .from("estadisticas")
      .select("titulo, categoria, valor, anio")
      .eq("anio", anio)
      .eq("titulo", "Espacios Totales"),
    client
      .from("metricas_alcaldia")
      .select("cantidad_espacios, actualizado_en")
      .eq("anio", anio),
    client.from("espacios_culturales").select("id", { count: "exact", head: true }),
    client
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true })
      .not("latitud", "is", null)
      .not("longitud", "is", null),
    client
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true })
      .not("latitud", "is", null)
      .not("longitud", "is", null)
      .or("alcaldia.is.null,alcaldia.eq."),
    client
      .from("espacios_culturales")
      .select("id", { count: "exact", head: true })
      .not("latitud", "is", null)
      .not("longitud", "is", null)
      .or("latitud.lt.19,latitud.gt.19.7,longitud.lt.-99.4,longitud.gt.-98.9"),
  ]);

  const rpcSum = (rpcRes.data ?? []).reduce(
    (sum, row) => sum + (Number(row.total_espacios) || 0),
    0,
  );
  const metricasSum = (metricasRes.data ?? []).reduce(
    (sum, row) => sum + (Number(row.cantidad_espacios) || 0),
    0,
  );
  const espaciosTotalesStat = statsRes.data?.[0]?.valor ?? null;

  console.log("=== Conteos del padrón ===");
  console.log(`Total en espacios_culturales:     ${totalRes.count?.toLocaleString("es-MX")}`);
  console.log(`Con coordenadas (lat/lng):        ${georefRes.count?.toLocaleString("es-MX")}`);
  console.log(`Georef sin alcaldía:              ${sinAlcaldiaRes.count?.toLocaleString("es-MX")}`);
  console.log(`Georef fuera bbox CDMX (app mapa): ${fueraCdmxRes.count?.toLocaleString("es-MX")}`);

  console.log("\n=== Fuentes del KPI en la app (año " + anio + ") ===");
  console.log(`estadisticas.Espacios Totales:    ${espaciosTotalesStat?.toLocaleString("es-MX") ?? "(no definido)"}`);
  console.log(`RPC obtener_estadisticas (suma):  ${rpcSum.toLocaleString("es-MX")}`);
  console.log(`metricas_alcaldia (suma):         ${metricasSum.toLocaleString("es-MX")}`);

  const kpiApp = espaciosTotalesStat ?? rpcSum;
  console.log("\n=== Lo que muestra la app ===");
  console.log(`KPI Total Espacios:               ${Number(kpiApp).toLocaleString("es-MX")}`);
  console.log(`(prioridad: estadisticas → RPC)`);

  const diffTotal = (totalRes.count ?? 0) - Number(kpiApp);
  const diffGeoref = (georefRes.count ?? 0) - Number(kpiApp);
  console.log("\n=== Diferencias ===");
  console.log(`BD total vs KPI app:              ${diffTotal >= 0 ? "+" : ""}${diffTotal}`);
  console.log(`BD georef vs KPI app:             ${diffGeoref >= 0 ? "+" : ""}${diffGeoref}`);

  if (rpcRes.error) console.warn("RPC error:", rpcRes.error.message);
  if (statsRes.error) console.warn("estadisticas error:", statsRes.error.message);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
