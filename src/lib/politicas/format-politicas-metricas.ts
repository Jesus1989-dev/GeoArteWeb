/** Formato de ciudadanos para KPIs y tarjetas. */
export function formatImpactoCiudadanos(total: number): string {
  if (total >= 1_000_000) {
    return `+${(total / 1_000_000).toFixed(1)}M`;
  }
  return `+${total.toLocaleString("es-MX")}`;
}

/** Formato de presupuesto en MXN para KPIs y tarjetas. */
export function formatPresupuestoMxn(totalMxn: number): string {
  if (totalMxn >= 1_000_000) {
    const millones = totalMxn / 1_000_000;
    return millones >= 10
      ? `${Math.round(millones)}M`
      : `${millones.toFixed(1)}M`;
  }
  if (totalMxn >= 1_000) {
    return `${Math.round(totalMxn / 1_000)}k`;
  }
  return String(totalMxn);
}

export function formatPresupuestoMxnDetalle(mxn: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(mxn);
}
