/** Consulta estadisticas por disciplina + alcaldía. Uso: node scripts/ops/check-disciplina-alcaldia.mjs */
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

const root = process.cwd();
loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env"));
loadEnvFile(join(root, "..", "GeoArte Movil", ".env"));

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error("Faltan credenciales Supabase en .env.local o GeoArte Movil/.env");
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false } });
const anio = Number(process.env.NEXT_PUBLIC_ANIO_CORTE_METRICAS) || 2026;
const disciplina = process.argv[2] ?? "Artes Escénicas";
const alcaldiaNombre = process.argv[3] ?? "Álvaro Obregón";

const { data: alcaldias, error: alcErr } = await client
  .from("alcaldias")
  .select("id, nombre");
if (alcErr) {
  console.error(alcErr.message);
  process.exit(1);
}

const alcaldia = alcaldias?.find((a) =>
  String(a.nombre).toLowerCase().includes(alcaldiaNombre.toLowerCase().slice(0, 8)),
);
const alcaldiaId = alcaldia?.id ?? null;

console.log(`\n=== ${disciplina} · ${alcaldia?.nombre ?? alcaldiaNombre} · anio ${anio} ===\n`);

const { data: rows, error } = await client
  .from("estadisticas")
  .select(
    "titulo, categoria, valor, alcaldia_id, disciplina_nombre, tipo_espacio_sic, segmento_nse",
  )
  .eq("anio", anio)
  .or(
    `disciplina_nombre.ilike.%${disciplina}%,tipo_espacio_sic.ilike.%${disciplina}%`,
  );

if (error) {
  console.error(error.message);
  process.exit(1);
}

const all = rows ?? [];
const forAlcaldia = alcaldiaId
  ? all.filter((r) => r.alcaldia_id === alcaldiaId)
  : [];
const cityWide = all.filter((r) => !r.alcaldia_id?.trim());

const byCategoria = (list) => {
  const m = new Map();
  for (const r of list) {
    const c = r.categoria ?? "(sin)";
    m.set(c, (m.get(c) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

console.log("Total filas disciplina (cualquier alcaldía):", all.length);
console.log("Por categoría (todas):", byCategoria(all));
console.log("\nFilas con alcaldia_id de", alcaldia?.nombre + ":", forAlcaldia.length);
console.log("Por categoría (alcaldía):", byCategoria(forAlcaldia));
console.log("\nFilas ciudad (alcaldia_id null):", cityWide.length);
console.log("Por categoría (ciudad):", byCategoria(cityWide));

const tipologias = new Set();
for (const r of forAlcaldia.length ? forAlcaldia : all) {
  const sic = r.tipo_espacio_sic?.trim();
  if (sic) tipologias.add(sic);
}
console.log("\nTipologías SIC vinculadas:", [...tipologias].sort().join(", ") || "(ninguna)");

if (forAlcaldia.length > 0) {
  console.log("\nMuestra (alcaldía, máx 12 filas):");
  for (const r of forAlcaldia.slice(0, 12)) {
    console.log(
      JSON.stringify({
        categoria: r.categoria,
        titulo: r.titulo,
        valor: r.valor,
        disciplina: r.disciplina_nombre,
        tipo_sic: r.tipo_espacio_sic,
        nse: r.segmento_nse,
      }),
    );
  }
} else if (cityWide.length > 0) {
  console.log("\nSin filas por alcaldía; muestra ciudad (máx 8):");
  for (const r of cityWide.slice(0, 8)) {
    console.log(
      JSON.stringify({
        categoria: r.categoria,
        titulo: r.titulo,
        disciplina: r.disciplina_nombre,
        tipo_sic: r.tipo_espacio_sic,
      }),
    );
  }
}

if (alcaldiaId) {
  const { count } = await client
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true })
    .ilike("alcaldia", `%${alcaldiaNombre.split(" ")[0]}%`);
  console.log("\nEspacios en padrón (alcaldía, sin filtrar disciplina):", count ?? 0);
}

const { data: discKpi } = await client
  .from("disciplinas_participacion_kpi")
  .select("orden, nombre")
  .order("orden");
console.log("\nDisciplinas en disciplinas_participacion_kpi:", discKpi?.map((d) => d.nombre).join(", "));

const { data: discNames } = await client
  .from("estadisticas")
  .select("disciplina_nombre")
  .eq("anio", anio)
  .not("disciplina_nombre", "is", null);
const freq = new Map();
for (const r of discNames ?? []) {
  const d = String(r.disciplina_nombre ?? "").trim();
  if (d) freq.set(d, (freq.get(d) ?? 0) + 1);
}
console.log(
  "\nValores disciplina_nombre en estadisticas (anio " + anio + "):",
  [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
);

if (alcaldiaId) {
  const { count: cntAld } = await client
    .from("estadisticas")
    .select("id", { count: "exact", head: true })
    .eq("alcaldia_id", alcaldiaId)
    .eq("anio", anio);
  const { count: cntGen } = await client
    .from("estadisticas")
    .select("id", { count: "exact", head: true })
    .eq("alcaldia_id", alcaldiaId)
    .eq("anio", anio)
    .ilike("categoria", "%género%");
  console.log(
    `\nFilas estadisticas ${anio} en ${alcaldia?.nombre}: total=${cntAld}, participación género=${cntGen}`,
  );
}

const { data: teatroRows } = await client
  .from("estadisticas")
  .select("disciplina_nombre, tipo_espacio_sic, alcaldia_id, categoria")
  .eq("anio", anio)
  .or("tipo_espacio_sic.ilike.%Teatro%,tipo_espacio_sic.ilike.%Auditorio%")
  .limit(15);
console.log("\nFilas con tipo_espacio_sic Teatro/Auditorio:", teatroRows?.length ?? 0);
for (const r of teatroRows ?? []) {
  console.log(
    JSON.stringify({
      categoria: r.categoria,
      disciplina: r.disciplina_nombre,
      tipo_sic: r.tipo_espacio_sic,
      tiene_alcaldia: Boolean(r.alcaldia_id),
    }),
  );
}

const { data: mapDisc } = await client
  .from("categoria_disciplinas_sugeridas")
  .select("disciplina, categoria_id")
  .ilike("disciplina", "%Artes Esc%");
console.log("\ncategoria_disciplinas_sugeridas → Artes Escénicas:", mapDisc?.length ?? 0, "filas");
if (mapDisc?.length) {
  const ids = mapDisc.map((r) => r.categoria_id);
  const { data: cats } = await client
    .from("categorias_espacios")
    .select("id, nombre")
    .in("id", ids);
  for (const c of cats ?? []) console.log(" - tipología SIC:", c.nombre);
}

if (alcaldiaId) {
  const { count: teatros } = await client
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true })
    .eq("alcaldia_id", alcaldiaId)
    .or("tipo.ilike.%Teatro%,tipo.ilike.%Auditorio%");
  const { count: teatrosNombre } = await client
    .from("espacios_culturales")
    .select("id", { count: "exact", head: true })
    .ilike("alcaldia", `%${alcaldiaNombre.split(" ")[0]}%`)
    .or("tipo.ilike.%Teatro%,tipo.ilike.%Auditorio%");
  console.log(
    `\nEspacios Teatro/Auditorio en ${alcaldia?.nombre}: por alcaldia_id=${teatros ?? 0}, por nombre alcaldía=${teatrosNombre ?? 0}`,
  );
}
