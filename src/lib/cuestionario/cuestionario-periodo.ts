const PERIODO_REGEX = /^\d{4}-S[12]$/;

export function esPeriodoCuestionario(periodo: string): boolean {
  return PERIODO_REGEX.test(periodo.trim());
}

/** Periodo semestral vigente (`2026-S1` / `2026-S2`). */
export function periodoSemestralActual(fecha = new Date()): string {
  const semestre = fecha.getMonth() + 1 <= 6 ? 1 : 2;
  return `${fecha.getFullYear()}-S${semestre}`;
}

/** `2026-S1` → `Semestre 1 de 2026`. */
export function etiquetaPeriodoSemestral(periodo: string): string {
  const partes = periodo.split("-");
  if (partes.length !== 2 || !partes[1]?.startsWith("S")) return periodo;
  return `Semestre ${partes[1].slice(1)} de ${partes[0]}`;
}

export function periodosSemestralesRecientes(cantidad = 6, desde = new Date()): string[] {
  const out: string[] = [];
  let y = desde.getFullYear();
  let s = desde.getMonth() + 1 <= 6 ? 1 : 2;
  for (let i = 0; i < cantidad; i++) {
    out.push(`${y}-S${s}`);
    if (s === 1) {
      s = 2;
      y -= 1;
    } else {
      s = 1;
    }
  }
  return out;
}
