/**
 * Diagnóstico del padrón espacios_culturales (completitud / estado editorial).
 * Réplica la lógica de src/lib/espacios/espacio-registro.ts
 *
 * Uso: node scripts/diagnostico-padron-espacios.mjs
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

function deriveEstado(row) {
  const hasCoords =
    row.latitud != null &&
    row.longitud != null &&
    Number.isFinite(Number(row.latitud)) &&
    Number.isFinite(Number(row.longitud));
  if (!hasCoords) return "Borrador";
  const hasHorario = (row.horario?.trim?.() ?? String(row.horario ?? "").trim()) !== "";
  const hasTelefono = (row.telefono?.trim?.() ?? String(row.telefono ?? "").trim()) !== "";
  if (!hasHorario || !hasTelefono) return "Revisión";
  return "Publicado";
}

function computeCompletitud(row) {
  let score = 0;
  const hasCoords =
    row.latitud != null &&
    row.longitud != null &&
    Number.isFinite(Number(row.latitud)) &&
    Number.isFinite(Number(row.longitud));
  if (hasCoords) score += 50;
  const horario = (row.horario?.trim?.() ?? String(row.horario ?? "").trim()) !== "";
  const telefono = (row.telefono?.trim?.() ?? String(row.telefono ?? "").trim()) !== "";
  if (horario) score += 25;
  if (telefono) score += 25;
  return score;
}

loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key || url.includes("TU_PROYECTO") || key.includes("TU_ANON")) {
  console.error(
    "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
  );
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function fetchAllEspacios() {
  const all = [];
  const chunkSize = 1000;
  const maxChunks = 25;
  let from = 0;

  for (let i = 0; i < maxChunks; i += 1) {
    const to = from + chunkSize - 1;
    const { data, error } = await client
      .from("espacios_culturales")
      .select("id, horario, telefono, latitud, longitud")
      .range(from, to);

    if (error) throw new Error(error.message);
    const rows = data ?? [];
    if (rows.length === 0) break;
    all.push(...rows);
    if (rows.length < chunkSize) break;
    from += chunkSize;
  }

  return all;
}

async function main() {
  console.log("Consultando espacios_culturales en Supabase…\n");
  const rows = await fetchAllEspacios();
  const total = rows.length;

  const porEstado = { Borrador: 0, Revisión: 0, Publicado: 0 };
  const porCompletitud = new Map();
  let sinHorario = 0;
  let sinTelefono = 0;
  let sinAmbosContacto = 0;
  let conCoords = 0;
  let sinCoords = 0;
  let conHorario = 0;
  let conTelefono = 0;

  for (const row of rows) {
    const estado = deriveEstado(row);
    porEstado[estado] = (porEstado[estado] ?? 0) + 1;

    const pct = computeCompletitud(row);
    porCompletitud.set(pct, (porCompletitud.get(pct) ?? 0) + 1);

    const hasCoords =
      row.latitud != null &&
      row.longitud != null &&
      Number.isFinite(Number(row.latitud)) &&
      Number.isFinite(Number(row.longitud));
    const h = String(row.horario ?? "").trim() !== "";
    const t = String(row.telefono ?? "").trim() !== "";

    if (hasCoords) conCoords += 1;
    else sinCoords += 1;
    if (h) conHorario += 1;
    else sinHorario += 1;
    if (t) conTelefono += 1;
    else sinTelefono += 1;
    if (!h && !t) sinAmbosContacto += 1;
  }

  const pct = (n) => (total === 0 ? "0" : ((100 * n) / total).toFixed(1));

  console.log(`Total registros: ${total.toLocaleString("es-MX")}\n`);

  console.log("--- Campos en BD ---");
  console.log(`Con coordenadas:     ${conCoords.toLocaleString("es-MX")} (${pct(conCoords)}%)`);
  console.log(`Sin coordenadas:     ${sinCoords.toLocaleString("es-MX")} (${pct(sinCoords)}%)`);
  console.log(`Con horario (≠ vacío): ${conHorario.toLocaleString("es-MX")} (${pct(conHorario)}%)`);
  console.log(`Sin horario:         ${sinHorario.toLocaleString("es-MX")} (${pct(sinHorario)}%)`);
  console.log(`Con teléfono:        ${conTelefono.toLocaleString("es-MX")} (${pct(conTelefono)}%)`);
  console.log(`Sin teléfono:        ${sinTelefono.toLocaleString("es-MX")} (${pct(sinTelefono)}%)`);
  console.log(
    `Sin horario Y sin tel.: ${sinAmbosContacto.toLocaleString("es-MX")} (${pct(sinAmbosContacto)}%)`,
  );

  console.log("\n--- Estado (calculado, como en dashboard) ---");
  for (const [k, v] of Object.entries(porEstado)) {
    console.log(`  ${k}: ${v.toLocaleString("es-MX")} (${pct(v)}%)`);
  }

  console.log("\n--- Completitud % (calculada) ---");
  const sortedPct = [...porCompletitud.entries()].sort((a, b) => a[0] - b[0]);
  for (const [k, v] of sortedPct) {
    console.log(`  ${k}%: ${v.toLocaleString("es-MX")} (${pct(v)}%)`);
  }

  const telefonoTop = new Map();
  const horarioTop = new Map();
  for (const row of rows) {
    const t = String(row.telefono ?? "").trim() || "(vacío)";
    const h = String(row.horario ?? "").trim() || "(vacío)";
    telefonoTop.set(t, (telefonoTop.get(t) ?? 0) + 1);
    horarioTop.set(h, (horarioTop.get(h) ?? 0) + 1);
  }
  const topN = (map, n = 5) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

  console.log("\n--- Valores más frecuentes (horario) ---");
  for (const [valor, n] of topN(horarioTop)) {
    const label = valor.length > 50 ? `${valor.slice(0, 47)}…` : valor;
    console.log(`  ${n.toLocaleString("es-MX")}×  ${label}`);
  }
  console.log("\n--- Valores más frecuentes (teléfono) ---");
  for (const [valor, n] of topN(telefonoTop)) {
    const label = valor.length > 50 ? `${valor.slice(0, 47)}…` : valor;
    console.log(`  ${n.toLocaleString("es-MX")}×  ${label}`);
  }

  if ((porCompletitud.get(75) ?? 0) === total && sinHorario === total) {
    console.log(
      "\n→ El 75% / Revisión en bloque se explica porque ningún registro tiene horario en BD (aunque sí teléfono y coordenadas).",
    );
  }

  console.log("\nListo.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
