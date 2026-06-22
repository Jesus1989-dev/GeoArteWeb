import type {
  AccionEstrategica,
  BrechaInversionAlcaldiaRow,
  EvidenciaDiagnosticoContenido,
  PoliticasHero,
  PoliticasHeroStat,
  PrioridadAccion,
  SeccionRecomendaciones,
  SeccionRecomendacionesIcon,
} from "@/lib/domain/politicas";
import {
  formatImpactoCiudadanos,
  formatPresupuestoMxn,
} from "@/lib/politicas/format-politicas-metricas";
import type { MetricaAlcaldiaResumen } from "@/lib/domain/dashboard";
import {
  evidenciaDiagnosticoContenido as evidenciaMock,
  politicasHero as politicasHeroMock,
  politicasHeroStats as politicasHeroStatsMock,
} from "@/lib/data/mock/politicas";

export type PoliticasRecomendacionRow = {
  id: string;
  objetivo_id: string;
  titulo: string;
  prioridad: string;
  costo_nivel: number;
  alcaldia: string;
  descripcion: string;
  impacto: string;
  impacto_ciudadanos: number | null;
  presupuesto_mxn: number | null;
  orden: number;
};

const SECCION_META: Record<
  Exclude<SeccionRecomendaciones["id"], never>,
  { titulo: string; icon: SeccionRecomendacionesIcon; subtitulo: string }
> = {
  genero: {
    titulo: "Cerrar brecha de género",
    icon: "zap",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de cerrar brecha de género.",
  },
  periferias: {
    titulo: "Infraestructura en Periferias",
    icon: "mapPin",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de infraestructura en periferias.",
  },
  digitalizacion: {
    titulo: "Digitalización",
    icon: "zap",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de digitalización.",
  },
  economia: {
    titulo: "Economía Creativa",
    icon: "zap",
    subtitulo:
      "Acciones focalizadas para el cumplimiento del pilar estratégico de economía creativa.",
  },
};

const OBJETIVO_ORDER = ["genero", "periferias", "digitalizacion", "economia"] as const;

function normalizePercent(n: number): number {
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(n);
}

function normalizeAlcaldiaKey(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Catálogo alcaldías + métricas SECTEI (16 demarcaciones). */
export function mergeMetricasConCatalogoAlcaldias(
  catalogo: string[],
  metricas: Array<MetricaAlcaldiaResumen & { alcaldiaNombre: string }>,
): Array<MetricaAlcaldiaResumen & { alcaldiaNombre: string }> {
  const byName = new Map(
    metricas.map((m) => [normalizeAlcaldiaKey(m.alcaldiaNombre), m]),
  );
  const nombres =
    catalogo.length > 0
      ? catalogo
      : [...new Set(metricas.map((m) => m.alcaldiaNombre).filter(Boolean))];

  return nombres.map((nombre) => {
    const found = byName.get(normalizeAlcaldiaKey(nombre));
    return (
      found ?? {
        alcaldiaNombre: nombre,
        cantidadEspacios: 0,
        porcentajeCobertura: 0,
        porcentajeBrecha: 0,
      }
    );
  });
}

function abbreviateAlcaldia(nombre: string): string {
  const trimmed = nombre.trim();
  if (trimmed.length <= 14) return trimmed;
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    const initials = words
      .slice(1)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join(".");
    return `${words[0]!.slice(0, 1)}.${initials ? ` ${initials}.` : ""}`.replace(/\s+/g, " ").trim();
  }
  return `${trimmed.slice(0, 12)}…`;
}

export function groupRecomendaciones(
  rows: PoliticasRecomendacionRow[],
): SeccionRecomendaciones[] {
  const byObjetivo = new Map<string, AccionEstrategica[]>();

  for (const row of rows) {
    const objetivo = row.objetivo_id;
    const list = byObjetivo.get(objetivo) ?? [];
    list.push({
      id: row.id,
      titulo: row.titulo,
      prioridad: row.prioridad as PrioridadAccion,
      costoNivel: Math.min(3, Math.max(1, Number(row.costo_nivel) || 1)) as 1 | 2 | 3,
      alcaldia: row.alcaldia,
      descripcion: row.descripcion,
      impacto: row.impacto,
      impactoCiudadanos:
        row.impacto_ciudadanos != null ? Number(row.impacto_ciudadanos) : null,
      presupuestoMxn:
        row.presupuesto_mxn != null ? Number(row.presupuesto_mxn) : null,
    });
    byObjetivo.set(objetivo, list);
  }

  const secciones: SeccionRecomendaciones[] = [];

  for (const id of OBJETIVO_ORDER) {
    const acciones = byObjetivo.get(id);
    if (!acciones?.length) continue;
    const meta = SECCION_META[id];
    secciones.push({
      id,
      titulo: meta.titulo,
      icon: meta.icon,
      subtitulo: meta.subtitulo,
      acciones: acciones.sort((a, b) => a.id.localeCompare(b.id)),
    });
  }

  return secciones;
}

export function buildBrechaInversionChart(
  metricas: Array<MetricaAlcaldiaResumen & { alcaldiaNombre?: string }>,
): BrechaInversionAlcaldiaRow[] {
  if (metricas.length === 0) return [];

  return [...metricas]
    .filter((m) => (m as { alcaldiaNombre?: string }).alcaldiaNombre?.trim())
    .sort(
      (a, b) =>
        b.porcentajeBrecha - a.porcentajeBrecha ||
        String((a as { alcaldiaNombre?: string }).alcaldiaNombre).localeCompare(
          String((b as { alcaldiaNombre?: string }).alcaldiaNombre),
          "es",
        ),
    )
    .map((m) => {
      const nombre = (m as { alcaldiaNombre?: string }).alcaldiaNombre ?? "";
      return {
        alcaldia: abbreviateAlcaldia(nombre),
        alcaldiaCompleta: nombre,
        deficit: normalizePercent(m.porcentajeBrecha),
        presupuesto: normalizePercent(m.porcentajeCobertura),
      };
    });
}

export function buildPoliticasHero(anioCorte: number): PoliticasHero {
  return {
    ...politicasHeroMock,
    badge: `Fase de Implementación · corte ${anioCorte}`,
  };
}

export function buildPoliticasHeroStats(input: {
  recomendaciones: AccionEstrategica[];
  totalAlcaldias: number;
  totalEspacios: number;
  brechaPromedio: number;
}): PoliticasHeroStat[] {
  const { recomendaciones, totalAlcaldias, totalEspacios, brechaPromedio } = input;
  const intervenciones = recomendaciones.length;

  const impactoDesdeDb = recomendaciones.reduce(
    (sum, a) => sum + (a.impactoCiudadanos ?? 0),
    0,
  );
  const presupuestoDesdeDb = recomendaciones.reduce(
    (sum, a) => sum + (a.presupuestoMxn ?? 0),
    0,
  );
  const usaImpactoDb = impactoDesdeDb > 0;
  const usaPresupuestoDb = presupuestoDesdeDb > 0;

  const impactoTotal = usaImpactoDb
    ? impactoDesdeDb
    : Math.max(totalEspacios * 120, intervenciones * 8_500);
  const presupuestoTotalMxn = usaPresupuestoDb
    ? presupuestoDesdeDb
    : Math.round(
        recomendaciones.reduce((sum, a) => sum + a.costoNivel * 4_500_000, 0),
      );

  return [
    {
      icon: "zap",
      value: String(intervenciones),
      label: "Intervenciones",
      sublabel: "Planificadas",
    },
    {
      icon: "users",
      value: formatImpactoCiudadanos(impactoTotal),
      label: "Impacto social",
      sublabel: usaImpactoDb ? "Ciudadanos (padrón)" : "Estimado",
    },
    {
      icon: "dollar",
      value: formatPresupuestoMxn(presupuestoTotalMxn),
      label: "Presupuesto",
      sublabel: usaPresupuestoDb ? "MXN registrados" : "MXN estimado",
    },
    {
      icon: "mapPin",
      value: String(totalAlcaldias || 16),
      label: "Municipios",
      sublabel: brechaPromedio > 0 ? `Brecha prom. ${Math.round(brechaPromedio)}%` : "CDMX",
    },
  ];
}

export function buildEvidenciaDiagnostico(input: {
  metricas: Array<MetricaAlcaldiaResumen & { alcaldiaNombre?: string }>;
  anioCorte: number;
}): EvidenciaDiagnosticoContenido {
  const { metricas, anioCorte } = input;

  if (metricas.length === 0) {
    return { ...evidenciaMock };
  }

  const brechas = metricas.map((m) => normalizePercent(m.porcentajeBrecha));
  const maxBrecha = Math.max(...brechas, 0);
  const umbralAlto = Math.max(70, Math.round(maxBrecha * 0.85));
  const criticas = metricas.filter(
    (m) => normalizePercent(m.porcentajeBrecha) >= 40,
  ).length;
  const oriente = metricas.filter((m) => {
    const nombre = ((m as { alcaldiaNombre?: string }).alcaldiaNombre ?? "").toLowerCase();
    return (
      nombre.includes("iztapalapa") ||
      nombre.includes("gustavo") ||
      nombre.includes("tláhuac") ||
      nombre.includes("tlahuac") ||
      nombre.includes("milpa") ||
      nombre.includes("xochimilco") ||
      nombre.includes("venustiano")
    );
  });
  const brechaOriente =
    oriente.length > 0
      ? oriente.reduce((s, m) => s + normalizePercent(m.porcentajeBrecha), 0) /
        oriente.length
      : 0;

  const highlight = `déficit superior al ${umbralAlto}%`;
  const parrafoBase =
    "El análisis espacial revela una correlación directa entre el déficit de infraestructura cultural y el nivel socioeconómico. Las recomendaciones priorizan las zonas con ";
  const parrafoFin =
    ", según el corte SECTEI y el padrón GeoArteCDMX.";

  return {
    titulo: evidenciaMock.titulo,
    parrafo: `${parrafoBase}${highlight}${parrafoFin}`,
    highlight,
    meta2025: `Reducir en un 15% la brecha de acceso en alcaldías del oriente (promedio actual ${Math.round(brechaOriente)}%).`,
    urgencia: `${criticas} alcaldía${criticas === 1 ? "" : "s"} requieren intervención inmediata por brecha ≥ 40% · corte ${anioCorte}.`,
  };
}

export function getMockPoliticasHeroStats(): PoliticasHeroStat[] {
  return politicasHeroStatsMock.map((s) => ({ ...s }));
}
