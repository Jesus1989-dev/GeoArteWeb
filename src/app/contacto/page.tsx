import { ContactoController } from "@/components/features/contacto/ContactoController";
import { getPublicSiteBaseUrl } from "@/lib/api-v1/base-url";
import { getContactoPageDataCached } from "@/lib/cache/server-page-cache";
import { placeholderMetadata } from "@/components/shared/PlaceholderPage";

export const metadata = placeholderMetadata("Recursos y Soporte");
export const revalidate = 60;

export default async function Page() {
  const apiBaseUrl = await getPublicSiteBaseUrl();
  const initialData = await getContactoPageDataCached(apiBaseUrl);
  return <ContactoController initialData={initialData} />;
}
