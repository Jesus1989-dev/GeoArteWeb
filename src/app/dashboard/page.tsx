import { DashboardController } from "@/components/features/dashboard/DashboardController";
import { getDashboardDataServer } from "@/lib/services/dashboard.service.server";
import { siteConfig } from "@/lib/constants/site";

export const metadata = {
  title: `Dashboard estadístico | ${siteConfig.name}`,
  description:
    "KPIs, participación, tendencias y comparador territorial de la infraestructura cultural en CDMX.",
};

export default async function Page() {
  const initialData = await getDashboardDataServer({ includeEspacios: false });
  return <DashboardController initialData={initialData} />;
}
