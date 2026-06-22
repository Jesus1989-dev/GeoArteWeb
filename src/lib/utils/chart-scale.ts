export function computeNiceYAxis(maxValue: number, tickCount = 4): {
  max: number;
  ticks: number[];
} {
  if (maxValue <= 0) {
    return { max: 100, ticks: [0, 25, 50, 75, 100] };
  }

  const padded = maxValue * 1.1;
  const rawStep = padded / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let niceNormalized: number;

  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;

  const step = niceNormalized * magnitude;
  const max = step * tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => index * step);

  return { max, ticks };
}

export function abbreviateTipologia(name: string, maxLength = 12): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 1).trim()}…`;
}

export function abbreviateAlcaldia(name: string, maxLength = 14): string {
  if (name.length <= maxLength) return name;

  const replacements: Record<string, string> = {
    "La Magdalena Contreras": "Magd. Contreras",
    "Cuajimalpa de Morelos": "Cuajimalpa",
    "Gustavo A. Madero": "G.A. Madero",
    "Venustiano Carranza": "V. Carranza",
    "Álvaro Obregón": "Á. Obregón",
  };

  return replacements[name] ?? `${name.slice(0, maxLength - 1).trim()}…`;
}
