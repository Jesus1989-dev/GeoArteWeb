import { Suspense } from "react";
import { InvestigacionController } from "@/components/features/investigacion/InvestigacionController";
import { PageLoadingSkeleton } from "@/components/shared/PageLoadingSkeleton";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";
import { getInvestigacionPageData } from "@/lib/services/investigacion.service";

export const metadata = placeholderMetadata("Investigación y repositorio");

export default async function Page() {
  const initialData = await getInvestigacionPageData();
  return (
    <Suspense fallback={<PageLoadingSkeleton message="Cargando repositorio cualitativo…" />}>
      <InvestigacionController initialData={initialData} />
    </Suspense>
  );
}
