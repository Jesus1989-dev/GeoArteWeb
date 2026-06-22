import { CuestionarioController } from "@/components/features/cuestionario/CuestionarioController";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";
import { getCuestionarioDataServer } from "@/lib/services/cuestionario.service.server";

export const metadata = placeholderMetadata("Cuestionario SECTEI");

export default async function Page() {
  const initialData = await getCuestionarioDataServer();
  return <CuestionarioController initialData={initialData} />;
}
