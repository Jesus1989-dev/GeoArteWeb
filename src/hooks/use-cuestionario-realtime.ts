"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/client";

/** Escucha INSERT/UPDATE en respuestas_cuestionario y dispara recarga. */
export function useCuestionarioRealtime(onChange: () => void, enabled = true) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const channel = client
      .channel("cuestionario-respuestas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "respuestas_cuestionario" },
        () => {
          onChangeRef.current();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [enabled]);
}
