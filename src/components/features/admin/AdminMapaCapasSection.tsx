"use client";

import Link from "next/link";
import { Map, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { AdminMapaCapasEstado } from "@/lib/domain/admin";
import type { AdminPageData } from "@/lib/services/admin.service";

type AdminMapaCapasSectionProps = {
  meta: AdminPageData["adminMapaCapasMeta"];
  estado: AdminMapaCapasEstado | null;
  loading: boolean;
  syncing: boolean;
  syncMessage: string | null;
  dataSource: AdminPageData["dataSource"];
  onRefresh: () => void;
  onSync: () => void;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-geo-border bg-geo-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-geo-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-geo-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-geo-muted">{hint}</p>}
    </div>
  );
}

export function AdminMapaCapasSection({
  meta,
  estado,
  loading,
  syncing,
  syncMessage,
  dataSource,
  onRefresh,
  onSync,
}: AdminMapaCapasSectionProps) {
  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 text-geo-navy">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-geo-border bg-geo-surface">
            <Map size={20} color="var(--geo-navy)" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-medium leading-tight">{meta.titulo}</h2>
            <p className="mt-1 text-sm text-geo-muted">{meta.subtitulo}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onRefresh}
            disabled={loading || syncing || dataSource !== "supabase"}
            className="gap-2 border border-geo-border"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden
            />
            Actualizar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSync}
            disabled={loading || syncing || dataSource !== "supabase"}
            className="gap-2"
          >
            <Zap className={`h-4 w-4 ${syncing ? "animate-pulse" : ""}`} aria-hidden />
            {meta.btnSincronizar}
          </Button>
        </div>
      </div>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase para sincronizar métricas y macrozonas del mapa.
        </p>
      )}

      {syncMessage && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {syncMessage}
        </p>
      )}

      {estado && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Espacios georreferenciados"
              value={estado.espaciosGeoref.toLocaleString("es-MX")}
            />
            <StatCard
              label="Métricas por alcaldía"
              value={estado.metricasAlcaldia}
              hint={`Año ${estado.anioCorte} · ${estado.ultimaMetricas}`}
            />
            <StatCard
              label="Geometrías territoriales"
              value={`${estado.geometriasAlcaldias} / ${estado.geometriasMacrozonas}`}
              hint={`Alcaldías / macrozonas · ${estado.ultimaGeometrias}`}
            />
            <StatCard
              label="Líneas de transporte"
              value={estado.lineasTransporte}
              hint={estado.ultimaTransporte}
            />
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
            <div className="border-b border-geo-border px-4 py-3">
              <h3 className="text-sm font-semibold text-geo-navy">{meta.historialTitulo}</h3>
            </div>
            <ResponsiveTable
              mobile={
                <div className="divide-y divide-geo-border">
                  {estado.ultimosSync.map((row, index) => (
                    <MobileDataCard
                      key={`${row.accion}-${row.ejecutadoEn}-${index}`}
                      title={row.accion}
                      subtitle={row.ejecutadoEn}
                    >
                      <MobileDataRow label="Filas" value={row.filasAfectadas} />
                      <MobileDataRow label="Detalle" value={row.mensaje} />
                    </MobileDataCard>
                  ))}
                  {estado.ultimosSync.length === 0 && !loading && (
                    <p className="px-4 py-10 text-center text-sm text-geo-muted">
                      Aún no hay sincronizaciones registradas.
                    </p>
                  )}
                </div>
              }
            >
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-geo-border bg-geo-surface/60 text-xs font-semibold uppercase tracking-wide text-geo-muted">
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">Filas</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {estado.ultimosSync.map((row, index) => (
                    <tr
                      key={`${row.accion}-${row.ejecutadoEn}-${index}`}
                      className="border-b border-geo-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-geo-navy">{row.accion}</td>
                      <td className="px-4 py-3 text-geo-muted">{row.filasAfectadas}</td>
                      <td className="px-4 py-3 text-geo-muted">{row.mensaje}</td>
                      <td className="px-4 py-3 text-geo-muted">{row.ejecutadoEn}</td>
                    </tr>
                  ))}
                  {estado.ultimosSync.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-geo-muted">
                        Aún no hay sincronizaciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ResponsiveTable>
          </div>
        </>
      )}

      <div className="mt-6 rounded-xl border border-dashed border-geo-border bg-geo-surface/40 p-4 text-sm text-geo-muted">
        <p className="font-medium text-geo-navy">Operación manual (GeoJSON)</p>
        <p className="mt-1">{meta.notaSeeds}</p>
        <code className="mt-2 block rounded bg-geo-card px-3 py-2 text-xs text-geo-navy">
          npm run seed:mapa
        </code>
        <p className="mt-2">{meta.notaCron}</p>
        <code className="mt-2 block rounded bg-geo-card px-3 py-2 text-xs text-geo-navy">
          npm run sync:mapa
        </code>
      </div>

      <p className="mt-4 text-sm text-geo-muted">
        Los resultados se publican en el{" "}
        <Link href="/mapa" className="font-medium text-geo-pink hover:underline">
          mapa interactivo
        </Link>
        . La capa base permanece en OpenStreetMap.
      </p>
    </section>
  );
}
