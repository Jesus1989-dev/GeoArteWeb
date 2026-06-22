import type { InvestigacionKpi, RecursoCualitativo } from "@/lib/domain/investigacion";

export function buildInvestigacionKpis(
  recursos: Pick<RecursoCualitativo, "digitalizado" | "alcaldia">[],
): InvestigacionKpi[] {
  const total = recursos.length;
  const digitalizados = recursos.filter((r) => r.digitalizado).length;
  const pct = total > 0 ? Math.round((digitalizados / total) * 100) : 0;
  const alcaldias = new Set(
    recursos.map((r) => r.alcaldia.trim()).filter((a) => a.length > 0),
  );

  return [
    { label: "Recursos totales", value: String(total), accent: "navy" },
    { label: "Digitalizados", value: `${pct}%`, accent: "pink" },
    { label: "Alcaldías", value: String(alcaldias.size), accent: "navy" },
  ];
}

export function buildMapaUrlForRecurso(recurso: RecursoCualitativo): string {
  const params = new URLSearchParams();
  params.set("recurso", recurso.id);

  const hasCoords =
    recurso.lat != null &&
    recurso.lng != null &&
    Number.isFinite(recurso.lat) &&
    Number.isFinite(recurso.lng);

  if (hasCoords) {
    params.set("lat", String(recurso.lat));
    params.set("lng", String(recurso.lng));
  } else if (recurso.alcaldia && recurso.alcaldia !== "Varias") {
    params.set("alcaldia", recurso.alcaldia);
    const q = recurso.titulo.trim();
    if (q) params.set("q", q);
  }

  return `/mapa?${params.toString()}`;
}

export function buildInvestigacionUrlForRecurso(recursoId: string): string {
  const params = new URLSearchParams();
  params.set("recurso", recursoId);
  return `/investigacion?${params.toString()}`;
}
