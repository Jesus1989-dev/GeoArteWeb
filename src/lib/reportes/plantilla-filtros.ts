import type { DashboardFilterState } from "@/lib/dashboard/apply-dashboard-filters";

export type PlantillaFiltroPick = "first" | "second" | "first_after_todos";

export type PlantillaFiltroValue = string | { pick: PlantillaFiltroPick | "first" | "second" };

export type PlantillaFiltrosDefault = {
  alcaldia?: PlantillaFiltroValue;
  disciplina?: string;
  periodo?: PlantillaFiltroValue;
  nse?: PlantillaFiltroValue;
  edad?: PlantillaFiltroValue;
  genero?: string;
};

export type PlantillaFiltroOpciones = {
  alcaldia: string[];
  disciplina: string[];
  periodo: string[];
  nivelSocioeconomico: string[];
  rangoEdad: string[];
  genero: string[];
};

function resolvePick(options: readonly string[], pick: PlantillaFiltroPick | "first" | "second"): string {
  if (pick === "first") return options[0] ?? "";
  if (pick === "second") return options[1] ?? options[0] ?? "";
  return options[1] ?? options[0] ?? "";
}

function resolveFilterValue(
  value: PlantillaFiltroValue | undefined,
  options: readonly string[],
  fallback: string,
): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  const picked = resolvePick(options, value.pick);
  return picked || fallback;
}

export function buildDefaultFiltersFromPlantilla(
  filtrosDefault: PlantillaFiltrosDefault,
  filtroOpciones: PlantillaFiltroOpciones,
): DashboardFilterState {
  return {
    alcaldia: resolveFilterValue(
      filtrosDefault.alcaldia,
      filtroOpciones.alcaldia,
      filtroOpciones.alcaldia[0] ?? "Todas",
    ),
    disciplina: resolveFilterValue(
      filtrosDefault.disciplina,
      filtroOpciones.disciplina,
      "Todas",
    ),
    periodo: resolveFilterValue(
      filtrosDefault.periodo,
      filtroOpciones.periodo,
      filtroOpciones.periodo[0] ?? "",
    ),
    nse: resolveFilterValue(
      filtrosDefault.nse,
      filtroOpciones.nivelSocioeconomico,
      "Todos",
    ),
    edad: resolveFilterValue(
      filtrosDefault.edad,
      filtroOpciones.rangoEdad,
      "Todos",
    ),
    genero: resolveFilterValue(
      filtrosDefault.genero,
      filtroOpciones.genero,
      "Todos",
    ),
  };
}

export function parsePlantillaFiltrosDefault(raw: unknown): PlantillaFiltrosDefault {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw as PlantillaFiltrosDefault;
}
