"use client";

import { useEffect, useRef, useState } from "react";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import type { TestLoginCredentials } from "@/lib/auth/test-login";

function hasAnyCreds(byRol: Partial<Record<RolPerfil, TestLoginCredentials>>) {
  return Object.values(byRol).some((c) => c?.email?.trim());
}

/** Carga TEST_LOGIN_* (servidor o API dev). `onReady` se invoca al tener credenciales. */
export function useTestLoginAutofill(
  fromServer: Partial<Record<RolPerfil, TestLoginCredentials>>,
  onReady?: (byRol: Partial<Record<RolPerfil, TestLoginCredentials>>) => void,
) {
  const [byRol, setByRol] = useState(fromServer);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (hasAnyCreds(fromServer)) {
      setByRol(fromServer);
      onReadyRef.current?.(fromServer);
      return;
    }

    let cancelled = false;
    fetch("/api/dev/test-login")
      .then((res) => (res.ok ? res.json() : {}))
      .then((json: Partial<Record<RolPerfil, TestLoginCredentials>>) => {
        if (cancelled || !hasAnyCreds(json)) return;
        setByRol(json);
        onReadyRef.current?.(json);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [fromServer]);

  return byRol;
}

export function credsForRol(
  byRol: Partial<Record<RolPerfil, TestLoginCredentials>>,
  rol: RolPerfil,
): TestLoginCredentials | undefined {
  const creds = byRol[rol];
  if (!creds?.email?.trim()) return undefined;
  return { email: creds.email.trim(), password: creds.password ?? "" };
}
