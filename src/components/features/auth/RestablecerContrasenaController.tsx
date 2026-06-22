"use client";

import { RestablecerContrasenaView } from "@/components/features/auth/RestablecerContrasenaView";
import { getAuthPageData } from "@/lib/services/auth.service";

export function RestablecerContrasenaController() {
  const data = getAuthPageData();
  return <RestablecerContrasenaView data={data} />;
}
