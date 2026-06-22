/** Segundos de revalidación ISR / Route Handlers estables. */
export const PAGE_REVALIDATE_SECONDS = 60;

/** Tiempo en cliente antes de considerar datos obsoletos (React Query). */
export const CLIENT_STALE_TIME_MS = PAGE_REVALIDATE_SECONDS * 1000;

/** Tiempo en caché del cliente tras desmontar una pestaña. */
export const CLIENT_GC_TIME_MS = CLIENT_STALE_TIME_MS * 5;
