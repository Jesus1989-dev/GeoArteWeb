import type { Espacio } from "@/lib/domain/mapa";

/** URL para abrir indicaciones hacia un espacio cultural (Google Maps). */
export function buildEspacioDirectionsUrl(
  espacio: Pick<Espacio, "lat" | "lng" | "nombre">,
): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${espacio.lat},${espacio.lng}`,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
