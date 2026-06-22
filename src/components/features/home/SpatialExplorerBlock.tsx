import Link from "next/link";
import { Expand } from "lucide-react";
import { SpatialExplorerPreview } from "@/components/features/home/SpatialExplorerPreview";
import type { SpatialExplorerPreviewData } from "@/lib/domain/home";

type SpatialExplorerBlockProps = {
  data: SpatialExplorerPreviewData;
};

export function SpatialExplorerBlock({ data }: SpatialExplorerBlockProps) {
  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-geo-navy">Explorador Espacial</h2>
          <p className="mt-0.5 text-sm text-geo-muted">
            Distribución geográfica de recintos por disciplina y alcaldía
          </p>
        </div>
        <Link
          href="/mapa"
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-geo-border bg-white px-3 py-2 text-sm text-geo-navy transition-colors hover:border-geo-pink hover:text-geo-pink sm:w-auto sm:py-1.5"
        >
          <Expand className="h-4 w-4" strokeWidth={1.75} />
          <span className="sm:hidden">Abrir mapa</span>
          <span className="hidden sm:inline">Pantalla Completa</span>
        </Link>
      </div>

      <Link
        href="/mapa"
        className="group relative block overflow-hidden rounded-2xl border border-amber-500/40 p-0.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] transition-shadow hover:border-amber-400/60 hover:shadow-[0_12px_40px_-8px_rgba(225,5,153,0.25)]"
      >
        <SpatialExplorerPreview data={data} />
      </Link>
    </div>
  );
}
