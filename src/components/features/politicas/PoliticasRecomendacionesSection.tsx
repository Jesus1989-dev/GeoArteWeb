import {
  Download,
  Loader2,
  MapPin,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type {
  AccionEstrategica,
  PrioridadAccion,
  SeccionRecomendaciones,
} from "@/lib/domain/politicas";
import {
  formatImpactoCiudadanos,
  formatPresupuestoMxnDetalle,
} from "@/lib/politicas/format-politicas-metricas";
import { cn } from "@/lib/utils";

const sectionIcons = {
  zap: Zap,
  mapPin: MapPin,
} satisfies Record<SeccionRecomendaciones["icon"], LucideIcon>;

const prioridadStyles: Record<PrioridadAccion, string> = {
  "Prioridad Alta": "bg-geo-pink text-white",
  "Prioridad Media": "bg-geo-navy text-white",
  "Prioridad Baja": "bg-slate-200 text-slate-600",
};

function CostoIndicador({ nivel }: { nivel: 1 | 2 | 3 }) {
  return (
    <span className="text-sm font-semibold text-geo-pink" aria-label={`Costo nivel ${nivel}`}>
      {"$".repeat(nivel)}
    </span>
  );
}

function AccionCard({
  accion,
  onDownloadBrief,
  downloading,
}: {
  accion: AccionEstrategica;
  onDownloadBrief?: (id: string) => void | Promise<void>;
  downloading?: boolean;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-geo-border bg-white shadow-sm">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              prioridadStyles[accion.prioridad],
            )}
          >
            {accion.prioridad}
          </span>
          <CostoIndicador nivel={accion.costoNivel} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-geo-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {accion.alcaldia}
        </div>

        <h3 className="mt-2 text-base font-bold leading-snug text-geo-navy">
          {accion.titulo}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-geo-muted">
          {accion.descripcion}
        </p>

        <div className="mt-4 rounded-lg bg-sky-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
            Impacto estimado
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-geo-navy">
            <TrendingUp className="h-4 w-4 shrink-0 text-geo-pink" strokeWidth={2.5} />
            {accion.impacto}
          </p>
          {(accion.impactoCiudadanos != null || accion.presupuestoMxn != null) && (
            <p className="mt-2 text-xs text-geo-muted">
              {accion.impactoCiudadanos != null && (
                <span>
                  {formatImpactoCiudadanos(accion.impactoCiudadanos)} ciudadanos
                </span>
              )}
              {accion.impactoCiudadanos != null && accion.presupuestoMxn != null && (
                <span> · </span>
              )}
              {accion.presupuestoMxn != null && (
                <span>{formatPresupuestoMxnDetalle(accion.presupuestoMxn)}</span>
              )}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={downloading}
        onClick={() => void onDownloadBrief?.(accion.id)}
        className="flex w-full items-center justify-center gap-2 border-t border-geo-border bg-geo-surface/80 py-3 text-sm font-medium text-geo-navy transition-colors hover:bg-geo-surface hover:text-geo-pink disabled:opacity-60"
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Download className="h-4 w-4" strokeWidth={2} />
        )}
        {downloading ? "Generando PDF…" : "Descargar Brief de Acción"}
      </button>
    </article>
  );
}

function SeccionObjetivo({
  seccion,
  onDownloadBrief,
  downloadingBriefId,
}: {
  seccion: SeccionRecomendaciones;
  onDownloadBrief?: (id: string) => void | Promise<void>;
  downloadingBriefId?: string | null;
}) {
  const Icon = sectionIcons[seccion.icon];

  return (
    <section className="space-y-5">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-geo-pink/10 text-geo-pink">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-geo-navy">{seccion.titulo}</h2>
          <p className="mt-1 text-sm text-geo-muted">{seccion.subtitulo}</p>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          seccion.acciones.length > 1 ? "md:grid-cols-2" : "max-w-xl",
        )}
      >
        {seccion.acciones.map((accion) => (
          <AccionCard
            key={accion.id}
            accion={accion}
            onDownloadBrief={onDownloadBrief}
            downloading={downloadingBriefId === accion.id}
          />
        ))}
      </div>
    </section>
  );
}

type PoliticasRecomendacionesSectionProps = {
  secciones: SeccionRecomendaciones[];
  onDownloadBrief?: (id: string) => void | Promise<void>;
  downloadingBriefId?: string | null;
};

export function PoliticasRecomendacionesSection({
  secciones,
  onDownloadBrief,
  downloadingBriefId,
}: PoliticasRecomendacionesSectionProps) {
  if (secciones.length === 0) {
    return (
      <p className="rounded-xl border border-geo-border bg-white p-8 text-center text-sm text-geo-muted">
        No hay recomendaciones para el filtro seleccionado.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-12">
      {secciones.map((seccion) => (
        <SeccionObjetivo
          key={seccion.id}
          seccion={seccion}
          onDownloadBrief={onDownloadBrief}
          downloadingBriefId={downloadingBriefId}
        />
      ))}
    </div>
  );
}
