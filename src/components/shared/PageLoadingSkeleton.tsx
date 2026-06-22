type PageLoadingSkeletonProps = {
  message?: string;
};

/** Skeleton de carga instantánea durante navegación (App Router loading.tsx). */
export function PageLoadingSkeleton({
  message = "Cargando…",
}: PageLoadingSkeletonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-geo-surface px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-geo-pink border-t-transparent" />
      <p className="text-sm text-geo-muted">{message}</p>
      <div className="mt-2 flex w-full max-w-md flex-col gap-2" aria-hidden>
        <div className="h-3 w-full animate-pulse rounded bg-geo-border/60" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-geo-border/40" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-geo-border/30" />
      </div>
    </div>
  );
}
