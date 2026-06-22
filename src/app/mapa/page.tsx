import { MapaLoader } from "@/components/mapa/MapaLoader";
import { getMapaDataCached } from "@/lib/cache/server-page-cache";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata("Mapa interactivo");
export const revalidate = 60;

export default async function MapaPage() {
  const initialData = await getMapaDataCached();
  return <MapaLoader initialData={initialData} />;
}
