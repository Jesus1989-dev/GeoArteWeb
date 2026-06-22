"use client";

import {
  Download,
  FileText,
  Mail,
  Map,
  RefreshCw,
  Settings,
  UserPlus,
  Building2,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { AdminLogEntry, AdminLogTipo } from "@/lib/domain/admin";
import { cn } from "@/lib/utils";

type AdminLogsSectionProps = {
  logs: AdminLogEntry[];
  loading: boolean;
  onRefresh: () => void;
};

const TIPO_META: Record<
  AdminLogTipo,
  { label: string; icon: typeof Download; className: string }
> = {
  export: {
    label: "Exportación",
    icon: Download,
    className: "bg-violet-100 text-violet-700",
  },
  espacio: {
    label: "Espacio",
    icon: Building2,
    className: "bg-sky-100 text-sky-700",
  },
  mapa_sync: {
    label: "Mapa",
    icon: Map,
    className: "bg-emerald-100 text-emerald-800",
  },
  consulta: {
    label: "Consulta",
    icon: Mail,
    className: "bg-amber-100 text-amber-800",
  },
  usuario: {
    label: "Usuario",
    icon: UserPlus,
    className: "bg-indigo-100 text-indigo-700",
  },
  reporte: {
    label: "Reporte",
    icon: FileText,
    className: "bg-rose-100 text-rose-800",
  },
  politica: {
    label: "Política",
    icon: FileText,
    className: "bg-fuchsia-100 text-fuchsia-800",
  },
  investigacion: {
    label: "Investigación",
    icon: ClipboardList,
    className: "bg-teal-100 text-teal-800",
  },
  config: {
    label: "Configuración",
    icon: Settings,
    className: "bg-slate-100 text-slate-700",
  },
};

export function AdminLogsSection({ logs, loading, onRefresh }: AdminLogsSectionProps) {
  const tiposPresentes = [...new Set(logs.map((l) => l.tipo))];

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-geo-muted">
            Actividad reciente del panel: sincronizaciones del mapa, exportaciones,
            espacios, consultas, usuarios, catálogos y configuración de centros.
          </p>
          {tiposPresentes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tiposPresentes.map((tipo) => {
                const meta = TIPO_META[tipo];
                return (
                  <span
                    key={tipo}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      meta.className,
                    )}
                  >
                    {meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onRefresh}
          disabled={loading}
          className="shrink-0 gap-2 border border-geo-border"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
          Actualizar
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
        <ul className="divide-y divide-geo-border/60">
          {logs.map((log) => {
            const meta = TIPO_META[log.tipo];
            const Icon = meta.icon;
            return (
              <li
                key={log.id}
                className="px-4 py-4 transition-colors hover:bg-geo-hover/60 sm:px-5"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
                      meta.className,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className="break-words text-sm font-semibold leading-snug text-foreground"
                          title={log.descripcion}
                        >
                          {log.descripcion}
                        </p>
                        <span
                          className={cn(
                            "mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                            meta.className,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <time
                        className="shrink-0 text-xs text-geo-muted sm:max-w-[9rem] sm:text-right"
                        dateTime={log.occurredAt}
                      >
                        {log.fecha}
                      </time>
                    </div>
                    <p className="mt-2 break-words text-xs leading-relaxed text-geo-muted">
                      {log.detalle}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
          {logs.length === 0 && !loading && (
            <li className="px-5 py-12 text-center text-sm text-geo-muted">
              Sin registros de actividad reciente. Ejecuta una sincronización del mapa,
              exporta un reporte o edita un catálogo para ver entradas aquí.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
