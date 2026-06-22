import { PoliticasController } from "@/components/features/politicas/PoliticasController";
import { getPoliticasPageDataCached } from "@/lib/cache/server-page-cache";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata(
  "Recomendaciones de política pública",
);
export const revalidate = 60;

export default async function Page() {
  const initialData = await getPoliticasPageDataCached();
  return <PoliticasController initialData={initialData} />;
}
