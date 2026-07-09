/** Consulta brecha por alcaldía. Uso: node scripts/ops/check-brecha-alcaldias.mjs */
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

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const anio = Number(process.env.NEXT_PUBLIC_ANIO_CORTE_METRICAS) || 2026;

async function countByAlcaldiaLive() {
  const counts = new Map();
  let from = 0;
  for (let i = 0; i < 5; i += 1) {
    const { data, error } = await client
      .from("espacios_culturales")
      .select("alcaldia, latitud, longitud")
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const a = String(row.alcaldia ?? "").trim() || "(vacío)";
      counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    if (data.length < 1000) break;
    from += 1000;
  }
  return counts;
}

async function countGeorefByAlcaldiaLive() {
  const counts = new Map();
  let from = 0;
  for (let i = 0; i < 5; i += 1) {
    const { data, error } = await client
      .from("espacios_culturales")
      .select("alcaldia")
      .not("latitud", "is", null)
      .not("longitud", "is", null)
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const a = String(row.alcaldia ?? "").trim() || "(vacío)";
      counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    if (data.length < 1000) break;
    from += 1000;
  }
  return counts;
}

function brechaSql(cantidad, max) {
  if (max === 0) return 0;
  return Math.min(100, Math.round(70 * (1 - cantidad / max)));
}

function brechaSectei(cantidad, maxOrTotal) {
  if (maxOrTotal <= 0 || cantidad <= 0) return 100;
  const cobertura = (cantidad / maxOrTotal) * 100;
  return Math.min(100, Math.max(0, Math.round(100 - cobertura)));
}

async function main() {
  const [{ data: metricas }, liveAll, liveGeoref] = await Promise.all([
    client
      .from("metricas_alcaldia")
      .select(
        "alcaldia_nombre, cantidad_espacios, porcentaje_cobertura, porcentaje_brecha, actualizado_en",
      )
      .eq("anio", anio)
      .order("cantidad_espacios", { ascending: false }),
    countByAlcaldiaLive(),
    countGeorefByAlcaldiaLive(),
  ]);

  const totalGeoref = [...liveGeoref.values()].reduce((s, n) => s + n, 0);
  const maxGeoref = Math.max(...liveGeoref.values(), 0);

  const cuauht = (metricas ?? []).find((r) =>
    /cuauht/i.test(String(r.alcaldia_nombre ?? "")),
  );

  const cuauhtLive = [...liveGeoref.entries()].find(([k]) => /cuauht/i.test(k));
  const cuauhtAll = [...liveAll.entries()].find(([k]) => /cuauht/i.test(k));

  console.log("=== Cuauhtémoc ===");
  console.log("metricas_alcaldia:", cuauht ?? "(no encontrada)");
  console.log("Padrón georef vivo:", cuauhtLive ? { alcaldia: cuauhtLive[0], count: cuauhtLive[1] } : null);
  console.log("Padrón total vivo:", cuauhtAll ? { alcaldia: cuauhtAll[0], count: cuauhtAll[1] } : null);

  if (cuauhtLive) {
    const [nombre, cnt] = cuauhtLive;
    console.log("\nBrecha mapa (SQL 70%, vs max alcaldía):", brechaSql(cnt, maxGeoref));
    console.log("Brecha cobertura SECTEI (móvil/web inicio):", brechaSectei(cnt, totalGeoref));
    console.log("Max georef alcaldía:", maxGeoref, "(¿Cuauhtémoc es la max?", cnt === maxGeoref, ")");
  }

  console.log("\n=== Top 5 metricas_alcaldia (año", anio + ") ===");
  for (const row of (metricas ?? []).slice(0, 5)) {
    console.log(
      `${row.alcaldia_nombre}: ${row.cantidad_espacios} esp · brecha ${row.porcentaje_brecha}% · cobertura ${row.porcentaje_cobertura}%`,
    );
  }

  console.log("\n=== Top 5 padrón georef vivo ===");
  const topGeoref = [...liveGeoref.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [nombre, cnt] of topGeoref) {
    console.log(
      `${nombre}: ${cnt} · brecha mapa ${brechaSql(cnt, maxGeoref)}% · brecha SECTEI ${brechaSectei(cnt, totalGeoref)}%`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
