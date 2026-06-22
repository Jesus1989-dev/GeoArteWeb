import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

const tables = [
  { name: "espacios_culturales", migration: "(base)" },
  { name: "categorias_espacios", migration: "(base)" },
  { name: "profiles", migration: "(base)" },
  { name: "fuentes_informacion", migration: "20260529_fuentes_informacion" },
  { name: "consultas_contacto", migration: "20260529_consultas_contacto" },
  { name: "contacto_centro_config", migration: "20260529_contacto_centro_config" },
  { name: "politicas_recomendaciones", migration: "20260529_politicas_recomendaciones" },
  { name: "politicas_centro_config", migration: "20260529_politicas_centro_config" },
  { name: "recursos_cualitativos", migration: "20260529_recursos_cualitativos" },
  { name: "reporte_plantillas", migration: "20260529_reporte_plantillas" },
  { name: "reportes_centro_config", migration: "20260529_reporte_plantillas" },
  { name: "export_downloads", migration: "20260529_export_downloads_xlsx" },
];

async function checkTable(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  });
  const countHeader = res.headers.get("content-range");
  let count = null;
  if (countHeader) {
    const m = countHeader.match(/\/(\d+|\*)/);
    if (m && m[1] !== "*") count = Number(m[1]);
  }
  const error = res.ok ? null : (await res.text()).slice(0, 160);
  return { ok: res.ok, status: res.status, count, error };
}

async function checkView(view) {
  const res = await fetch(`${url}/rest/v1/${view}?select=metrica&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { ok: res.ok, status: res.status, error: res.ok ? null : (await res.text()).slice(0, 160) };
}

console.log(`Proyecto: ${url.replace("https://", "")}\n`);

const results = [];
for (const t of tables) {
  const r = await checkTable(t.name);
  results.push({ ...t, ...r });
}

const view = await checkView("v_sectei_validacion_datos");

for (const r of results) {
  const icon = r.ok ? "OK" : "FALTA";
  const detail =
    r.ok && r.count != null
      ? `${r.count} filas`
      : r.error || `HTTP ${r.status}`;
  console.log(`${icon.padEnd(6)} ${r.name.padEnd(28)} ${r.migration.padEnd(42)} ${detail}`);
}

const vicon = view.ok ? "OK" : "FALTA";
console.log(
  `${vicon.padEnd(6)} ${"v_sectei_validacion_datos".padEnd(28)} ${"(vista base)".padEnd(42)} ${
    view.ok ? "accesible" : view.error || `HTTP ${view.status}`
  }`,
);

const missing = results.filter((r) => !r.ok);
console.log("");
if (missing.length === 0 && view.ok) {
  console.log("RESULTADO: Todas las tablas del panel admin existen en Supabase.");
} else {
  console.log(
    `RESULTADO: Faltan ${missing.length} tabla(s). Ejecuta los SQL en supabase/migrations/ (SQL Editor o CLI).`,
  );
  for (const m of missing) console.log(`  - ${m.migration}.sql`);
}
