"use client";

import { RegistroView } from "@/components/features/auth/RegistroView";
import { getAuthPageData } from "@/lib/services/auth.service";

export function RegistroController() {
  const data = getAuthPageData();
  return <RegistroView data={data} />;
}
