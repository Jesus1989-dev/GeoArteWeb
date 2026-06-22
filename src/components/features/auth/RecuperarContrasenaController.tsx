"use client";

import { RecuperarContrasenaView } from "@/components/features/auth/RecuperarContrasenaView";
import { getAuthPageData } from "@/lib/services/auth.service";

export function RecuperarContrasenaController() {
  const data = getAuthPageData();
  return <RecuperarContrasenaView data={data} />;
}
