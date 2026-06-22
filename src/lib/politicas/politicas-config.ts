import type { AdminPoliticasCentroConfigFormInput } from "@/lib/domain/admin";
import {
  filtrosObjetivo as filtrosMock,
  politicasCta as ctaMock,
  politicasHero as heroMock,
} from "@/lib/data/mock/politicas";
import type {
  FiltroObjetivo,
  FiltroObjetivoId,
  PoliticasCta,
  PoliticasHero,
} from "@/lib/domain/politicas";

const FILTRO_IDS: FiltroObjetivoId[] = [
  "todos",
  "genero",
  "periferias",
  "digitalizacion",
  "economia",
];

export type PoliticasCentroConfigRaw = {
  heroBadge: string;
  heroTituloLinea1: string;
  heroTituloLinea2: string;
  heroDescripcion: string;
  ctaTitulo: string;
  ctaDescripcion: string;
  ctaBoton: string;
  ctaHref: string;
  filtrosObjetivo: FiltroObjetivo[];
};

export type PoliticasCentroConfigResolved = {
  hero: PoliticasHero;
  filtrosObjetivo: FiltroObjetivo[];
  politicasCta: PoliticasCta;
};

export function applyPoliticasHeroBadge(template: string, anioCorte: number): string {
  const trimmed = template.trim();
  if (!trimmed) {
    return `Fase de Implementación · corte ${anioCorte}`;
  }
  if (trimmed.includes("{anio}")) {
    return trimmed.replaceAll("{anio}", String(anioCorte));
  }
  return trimmed;
}

export function parseFiltrosObjetivo(raw: unknown): FiltroObjetivo[] {
  if (!Array.isArray(raw)) {
    return filtrosMock.map((f) => ({ ...f }));
  }

  const parsed: FiltroObjetivo[] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") continue;
    const id = String((item as { id?: unknown }).id ?? "").trim() as FiltroObjetivoId;
    const label = String((item as { label?: unknown }).label ?? "").trim();
    if (!FILTRO_IDS.includes(id) || !label) continue;
    parsed.push({ id, label });
  }

  if (!parsed.some((f) => f.id === "todos")) {
    parsed.unshift({ id: "todos", label: "Todos" });
  }

  return parsed.length > 0 ? parsed : filtrosMock.map((f) => ({ ...f }));
}

export function stringifyFiltrosObjetivo(filtros: FiltroObjetivo[]): string {
  return JSON.stringify(filtros, null, 2);
}

export function getDefaultPoliticasCentroConfigRaw(): PoliticasCentroConfigRaw {
  return {
    heroBadge: "Fase de Implementación · corte {anio}",
    heroTituloLinea1: heroMock.tituloLinea1,
    heroTituloLinea2: heroMock.tituloLinea2,
    heroDescripcion: heroMock.descripcion,
    ctaTitulo: ctaMock.titulo,
    ctaDescripcion: ctaMock.descripcion,
    ctaBoton: ctaMock.boton,
    ctaHref: ctaMock.href,
    filtrosObjetivo: filtrosMock.map((f) => ({ ...f })),
  };
}

export function resolvePoliticasCentroConfig(
  raw: PoliticasCentroConfigRaw,
  anioCorte: number,
): PoliticasCentroConfigResolved {
  return {
    hero: {
      badge: applyPoliticasHeroBadge(raw.heroBadge, anioCorte),
      tituloLinea1: raw.heroTituloLinea1.trim() || heroMock.tituloLinea1,
      tituloLinea2: raw.heroTituloLinea2.trim() || heroMock.tituloLinea2,
      descripcion: raw.heroDescripcion.trim() || heroMock.descripcion,
    },
    filtrosObjetivo: parseFiltrosObjetivo(raw.filtrosObjetivo),
    politicasCta: {
      titulo: raw.ctaTitulo.trim() || ctaMock.titulo,
      descripcion: raw.ctaDescripcion.trim() || ctaMock.descripcion,
      boton: raw.ctaBoton.trim() || ctaMock.boton,
      href: raw.ctaHref.trim() || ctaMock.href,
    },
  };
}

export function politicasCentroConfigToFormInput(
  raw: PoliticasCentroConfigRaw,
): AdminPoliticasCentroConfigFormInput {
  return {
    heroBadge: raw.heroBadge,
    heroTituloLinea1: raw.heroTituloLinea1,
    heroTituloLinea2: raw.heroTituloLinea2,
    heroDescripcion: raw.heroDescripcion,
    ctaTitulo: raw.ctaTitulo,
    ctaDescripcion: raw.ctaDescripcion,
    ctaBoton: raw.ctaBoton,
    ctaHref: raw.ctaHref,
    filtrosObjetivoJson: stringifyFiltrosObjetivo(raw.filtrosObjetivo),
  };
}
