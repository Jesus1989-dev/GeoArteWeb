"use client";

import { EmailVerificadoView } from "@/components/features/auth/EmailVerificadoView";
import { getAuthPageData } from "@/lib/services/auth.service";

export function EmailVerificadoController() {
  const data = getAuthPageData();
  return <EmailVerificadoView data={data} />;
}
