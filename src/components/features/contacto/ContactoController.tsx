"use client";

import { useContactoPageData } from "@/hooks/use-contacto-page-data";
import type { ContactoPageData } from "@/lib/services/contacto.service";
import { ContactoView } from "./ContactoView";

type ContactoControllerProps = {
  initialData?: ContactoPageData;
};

/** Controlador — contacto y documentación (Supabase o mock). */
export function ContactoController({ initialData }: ContactoControllerProps) {
  const { data, error, isLoading } = useContactoPageData(initialData);

  if (error != null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4 text-center">
        <p className="text-sm font-medium text-geo-navy">Error al cargar Recursos y Soporte</p>
        <p className="max-w-md text-sm text-geo-muted">{error}</p>
      </div>
    );
  }

  if (isLoading || data == null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-geo-surface px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
        <p className="text-sm text-geo-muted">Cargando recursos y soporte…</p>
      </div>
    );
  }

  return <ContactoView data={data} />;
}
