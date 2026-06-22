import {
  createEmptyCapaMapaState,
  ESPEACIO_TIPOS,
  type CapaMapaState,
  type EspacioTipo,
} from "@/lib/domain/mapa";
import type { MapaCapasToggleId } from "@/lib/domain/mapa-territorial";
import { createDefaultCapasToggle } from "@/lib/domain/mapa-territorial";

export type MapaPresetId = "infra" | "territorial";

function allCapasHidden(): CapaMapaState {
  return createEmptyCapaMapaState();
}

/** Atajo del preset «Puntos culturales»: activa las 12 tipologías SIC. */
function allInfraCapasVisible(): CapaMapaState {
  const state = createEmptyCapaMapaState();
  for (const tipo of ESPEACIO_TIPOS) {
    state[tipo] = { visible: true, opacity: 80 };
  }
  return state;
}

export function applyMapaPreset(preset: MapaPresetId): {
  capaMapa: CapaMapaState;
  capasExtra: Record<MapaCapasToggleId, boolean>;
} {
  if (preset === "territorial") {
    return {
      capaMapa: allCapasHidden(),
      capasExtra: {
        ...createDefaultCapasToggle(),
        densidad: true,
        cobertura: true,
        nivel: true,
      },
    };
  }

  return {
    capaMapa: allInfraCapasVisible(),
    capasExtra: {
      ...createDefaultCapasToggle(),
    },
  };
}

export { ESPEACIO_TIPOS, type EspacioTipo };
