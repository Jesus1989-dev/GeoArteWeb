"use client";

import { VerificarEmailView } from "@/components/features/auth/VerificarEmailView";
import { getAuthPageData } from "@/lib/services/auth.service";

export function VerificarEmailController() {
  const data = getAuthPageData();
  return <VerificarEmailView data={data} />;
}
