import { AdminController } from "@/components/features/admin/AdminController";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata("Panel de administración");

export default function Page() {
  return <AdminController />;
}
