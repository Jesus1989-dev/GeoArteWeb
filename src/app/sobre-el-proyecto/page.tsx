import { SobreElProyectoController } from "@/components/features/sobre-el-proyecto/SobreElProyectoController";
import { getSobreElProyectoPageDataCached } from "@/lib/cache/server-page-cache";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata("Proyecto");
export const revalidate = 60;

export default async function Page() {
  const initialData = await getSobreElProyectoPageDataCached();
  return <SobreElProyectoController initialData={initialData} />;
}
