import { PerfilController } from "@/components/features/perfil/PerfilController";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata("Mi perfil");

export default function Page() {
  return <PerfilController />;
}
