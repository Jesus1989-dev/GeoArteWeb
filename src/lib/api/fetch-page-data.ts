import {
  isStableDataApiRoute,
  PAGE_REVALIDATE_SECONDS,
} from "@/lib/cache/stable-api-routes";

type FetchPageDataOptions = {
  /** Fuerza no-store aunque la ruta sea estable. */
  noStore?: boolean;
};

/** Carga datos vía API (servidor) para evitar consultas pesadas colgadas en el navegador. */
export async function fetchPageData<T>(
  path: string,
  options?: FetchPageDataOptions,
): Promise<T> {
  const stable = !options?.noStore && isStableDataApiRoute(path);
  const res = await fetch(
    path,
    stable
      ? { next: { revalidate: PAGE_REVALIDATE_SECONDS } }
      : { cache: "no-store" },
  );
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof body === "object" && body != null && "error" in body && body.error
        ? body.error
        : `Error HTTP ${res.status}`,
    );
  }
  return body;
}
