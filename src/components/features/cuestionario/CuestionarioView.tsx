"use client";

import {
  Building2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  Radio,
  RefreshCw,
  Smartphone,
  Users,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import { downloadCuestionarioExportClient } from "@/lib/cuestionario/download-export-client";
import type { CuestionarioControllerState } from "@/hooks/use-cuestionario-controller";
import { cn } from "@/lib/utils";
import { useState } from "react";

function FilterSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-geo-border bg-geo-input px-3 py-2 text-sm text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20 disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CuestionarioView({
  data,
  periodo,
  alcaldia,
  loading,
  error,
  setPeriodo,
  setAlcaldia,
  reload,
  resumenFiltrado,
}: CuestionarioControllerState) {
  const [exporting, setExporting] = useState<"PDF" | "XLSX" | null>(null);
  const periodoLabels = data.periodoOpciones.map((p) => ({
    value: p,
    label: p,
  }));

  return (
    <div className="min-h-screen bg-geo-surface pb-16">
      <div className="border-b border-geo-border bg-geo-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-geo-pink">
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Cuestionario SECTEI
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-geo-navy sm:text-3xl">
                Captura semestral de espacios culturales
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-geo-muted">
                Respuestas guardadas desde la app móvil GeoArteCDMX en la misma base
                Supabase. Aquí ves el resumen por alcaldía y el detalle por espacio.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={reload}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualizar
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={exporting != null || loading}
              onClick={async () => {
                setExporting("PDF");
                try {
                  await downloadCuestionarioExportClient({
                    periodo,
                    alcaldia,
                    format: "PDF",
                  });
                } finally {
                  setExporting(null);
                }
              }}
            >
              {exporting === "PDF" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exporting != null || loading}
              onClick={async () => {
                setExporting("XLSX");
                try {
                  await downloadCuestionarioExportClient({
                    periodo,
                    alcaldia,
                    format: "XLSX",
                  });
                } finally {
                  setExporting(null);
                }
              }}
            >
              {exporting === "XLSX" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Exportar Excel
            </Button>
            {data.dataSource === "supabase" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                <Radio className="h-3.5 w-3.5" />
                Sincronización en vivo activa
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>
              La captura se hace en la <strong>app móvil</strong>; esta web muestra
              los datos en tiempo casi real al recargar.
            </span>
          </div>

          <p className="mt-3 text-xs text-geo-muted">{data.dataSourceNote}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-geo-muted">
                {kpi.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-geo-navy">{kpi.value}</p>
              <p className="mt-1 text-xs text-geo-muted">{kpi.hint}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-geo-pink" />
            <h2 className="font-semibold text-geo-navy">Filtros</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
            <FilterSelect
              label="Periodo semestral"
              options={periodoLabels.map((p) => p.value)}
              value={periodo}
              onChange={setPeriodo}
              disabled={loading}
            />
            <FilterSelect
              label="Alcaldía"
              options={data.alcaldiaOpciones}
              value={alcaldia}
              onChange={setAlcaldia}
              disabled={loading}
            />
          </div>
          <p className="mt-3 text-xs text-geo-muted">
            Periodo activo: <strong>{data.periodoEtiqueta}</strong>
            {loading && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Actualizando…
              </span>
            )}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-geo-navy">
              Resumen por alcaldía
            </h2>
            <span className="text-xs text-geo-muted">
              Fuente: v_cuestionario_resumen_alcaldia
            </span>
          </div>
          <div className="rounded-xl border border-geo-border bg-geo-card shadow-sm">
            <ResponsiveTable
              mobile={
                <div className="divide-y divide-geo-border">
                  {resumenFiltrado.map((row) => (
                    <MobileDataCard
                      key={`${row.periodo}-${row.alcaldiaNombre}`}
                      title={row.alcaldiaNombre}
                    >
                      <MobileDataRow label="Respuestas" value={row.respuestasCapturadas} />
                      <MobileDataRow label="Espacios" value={row.espaciosConRespuesta} />
                      <MobileDataRow
                        label="Usuarios"
                        value={row.totalUsuariosInscritos.toLocaleString("es-MX")}
                      />
                      <MobileDataRow
                        label="Aforo"
                        value={row.aforoInstaladoTotal.toLocaleString("es-MX")}
                      />
                      <MobileDataRow
                        label="Empleo"
                        value={row.empleoRemuneradoTotal.toLocaleString("es-MX")}
                      />
                      <MobileDataRow label="Convenios" value={row.conveniosReportados} />
                      <MobileDataRow
                        label="% mujeres prom."
                        value={
                          row.pctMujeresPromedio != null
                            ? `${row.pctMujeresPromedio}%`
                            : "—"
                        }
                      />
                    </MobileDataCard>
                  ))}
                  {resumenFiltrado.length === 0 && (
                    <p className="px-4 py-10 text-center text-sm text-geo-muted">
                      Sin respuestas para este periodo.
                    </p>
                  )}
                </div>
              }
            >
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-geo-border bg-geo-surface text-xs uppercase tracking-wide text-geo-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Alcaldía</th>
                  <th className="px-4 py-3 font-semibold">Resp.</th>
                  <th className="px-4 py-3 font-semibold">Espacios</th>
                  <th className="px-4 py-3 font-semibold">Usuarios</th>
                  <th className="px-4 py-3 font-semibold">Aforo</th>
                  <th className="px-4 py-3 font-semibold">Empleo</th>
                  <th className="px-4 py-3 font-semibold">Convenios</th>
                  <th className="px-4 py-3 font-semibold">% mujeres prom.</th>
                </tr>
              </thead>
              <tbody>
                {resumenFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-geo-muted">
                      <div className="flex flex-col items-center gap-2">
                        <Info className="h-8 w-8 opacity-40" />
                        <p>Sin respuestas para este periodo.</p>
                        <p className="text-xs">
                          Captura cuestionarios en la app móvil con sesión iniciada.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  resumenFiltrado.map((row) => (
                    <tr
                      key={`${row.periodo}-${row.alcaldiaNombre}`}
                      className="border-b border-geo-border/70 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-geo-navy">
                        {row.alcaldiaNombre}
                      </td>
                      <td className="px-4 py-3">{row.respuestasCapturadas}</td>
                      <td className="px-4 py-3">{row.espaciosConRespuesta}</td>
                      <td className="px-4 py-3">
                        {row.totalUsuariosInscritos.toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3">
                        {row.aforoInstaladoTotal.toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3">
                        {row.empleoRemuneradoTotal.toLocaleString("es-MX")}
                      </td>
                      <td className="px-4 py-3">{row.conveniosReportados}</td>
                      <td className="px-4 py-3">
                        {row.pctMujeresPromedio != null
                          ? `${row.pctMujeresPromedio}%`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </ResponsiveTable>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-geo-pink" />
              <h2 className="text-lg font-semibold text-geo-navy">
                Detalle por espacio ({data.totalDetalle})
              </h2>
            </div>
            <span className="text-xs text-geo-muted">
              Fuente: respuestas_cuestionario
            </span>
          </div>
          <div className="rounded-xl border border-geo-border bg-geo-card shadow-sm">
            <ResponsiveTable
              mobile={
                <div className="divide-y divide-geo-border">
                  {data.detalleEspacios.map((row) => (
                    <MobileDataCard
                      key={row.id}
                      title={row.espacioNombre}
                      subtitle={row.espacioAlcaldia}
                    >
                      <MobileDataRow label="Aforo" value={row.aforo ?? "—"} />
                      <MobileDataRow label="Costo" value={row.costoEtiqueta} />
                      <MobileDataRow label="Usuarios" value={row.usuarios ?? "—"} />
                      <MobileDataRow label="% mujeres" value={row.pctMujeresEtiqueta} />
                      <MobileDataRow label="Edad" value={row.rangoEdadEtiqueta} />
                      <MobileDataRow label="Traslado" value={row.tiempoViajeEtiqueta} />
                      <MobileDataRow label="Personal" value={row.personal ?? "—"} />
                      <MobileDataRow label="Convenios" value={row.convenios ?? "—"} />
                      <MobileDataRow
                        label="Actualizado"
                        value={formatFecha(row.actualizadoEl)}
                      />
                    </MobileDataCard>
                  ))}
                  {data.detalleEspacios.length === 0 && (
                    <p className="px-4 py-10 text-center text-sm text-geo-muted">
                      No hay respuestas detalladas para los filtros seleccionados.
                    </p>
                  )}
                </div>
              }
            >
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-geo-border bg-geo-surface text-xs uppercase tracking-wide text-geo-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Espacio</th>
                  <th className="px-4 py-3 font-semibold">Alcaldía</th>
                  <th className="px-4 py-3 font-semibold">Aforo</th>
                  <th className="px-4 py-3 font-semibold">Costo</th>
                  <th className="px-4 py-3 font-semibold">Usuarios</th>
                  <th className="px-4 py-3 font-semibold">% mujeres</th>
                  <th className="px-4 py-3 font-semibold">Edad</th>
                  <th className="px-4 py-3 font-semibold">Traslado</th>
                  <th className="px-4 py-3 font-semibold">Personal</th>
                  <th className="px-4 py-3 font-semibold">Convenios</th>
                  <th className="px-4 py-3 font-semibold">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {data.detalleEspacios.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-geo-muted">
                      No hay respuestas detalladas para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  data.detalleEspacios.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-geo-border/70 last:border-0"
                    >
                      <td className="max-w-[200px] px-4 py-3 font-medium text-geo-navy">
                        {row.espacioNombre}
                      </td>
                      <td className="px-4 py-3">{row.espacioAlcaldia}</td>
                      <td className="px-4 py-3">{row.aforo ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.costoEtiqueta}
                      </td>
                      <td className="px-4 py-3">{row.usuarios ?? "—"}</td>
                      <td className="px-4 py-3">{row.pctMujeresEtiqueta}</td>
                      <td className="px-4 py-3">{row.rangoEdadEtiqueta}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.tiempoViajeEtiqueta}
                      </td>
                      <td className="px-4 py-3">{row.personal ?? "—"}</td>
                      <td className="px-4 py-3">{row.convenios ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-geo-muted">
                        {formatFecha(row.actualizadoEl)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </ResponsiveTable>
          </div>
        </section>

        <p
          className={cn(
            "mt-6 text-center text-xs text-geo-muted",
            data.dataSource === "mock" && "text-amber-700",
          )}
        >
          {data.dataSource === "supabase"
            ? "Datos en vivo desde Supabase · misma base que la app móvil Flutter"
            : data.dataSourceNote}
        </p>
      </div>
    </div>
  );
}
