export function colorForPercent(value: number, hue: "green" | "blue" | "red"): string {
  const clamped = Math.max(0, Math.min(100, value));

  if (hue === "green") {
    const r = Math.round(220 - clamped * 1.4);
    const g = Math.round(120 + clamped * 1.1);
    const b = Math.round(130 - clamped * 0.5);
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (hue === "blue") {
    const r = Math.round(230 - clamped * 1.5);
    const g = Math.round(240 - clamped * 0.8);
    const b = Math.round(180 + clamped * 0.75);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const r = Math.round(180 + clamped * 0.75);
  const g = Math.round(220 - clamped * 1.2);
  const b = Math.round(160 - clamped * 0.6);
  return `rgb(${r}, ${g}, ${b})`;
}

export function radiusForPercent(value: number, min = 1200, max = 4200): number {
  const clamped = Math.max(0, Math.min(100, value));
  return min + (max - min) * (clamped / 100);
}
