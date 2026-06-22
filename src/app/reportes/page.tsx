import { ReportesController } from "@/components/features/reportes/ReportesController";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata("Centro de reportes");

export default function Page() {
  return <ReportesController />;
}
