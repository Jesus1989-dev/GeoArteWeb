"use client";

import type { AdminValidacionMetrica } from "@/lib/domain/admin";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import { cn } from "@/lib/utils";

type AdminPendientesSectionProps = {
  metricas: AdminValidacionMetrica[];
  badge: number;
};

export function AdminPendientesSection({ metricas, badge }: AdminPendientesSectionProps) {
  const alertas = metricas.filter((m) => {
    const valor = Number.parseInt(m.valor, 10);
    if (!Number.isFinite(valor) || valor <= 0) return false;
    const text = m.metrica.toLowerCase();
    return text.includes("sin ") || text.includes("distinto");
  });

  return (
    <section className="mt-10">
      <div className="rounded-xl border border-pink-100 bg-geo-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-geo-navy">Calidad del padrón</h2>
            <p className="mt-1 text-sm text-geo-muted">
              Resumen desde <code className="text-xs">v_sectei_validacion_datos</code> — idealmente
              los contadores &quot;sin …&quot; deben ser 0.
            </p>
          </div>
          <span className="rounded-full bg-geo-pink px-3 py-1 text-sm font-bold text-white">
            {badge.toLocaleString("es-MX")} pendientes
          </span>
        </div>

        <ResponsiveTable
          mobile={
            <div className="mt-6 divide-y divide-geo-border">
              {alertas.map((row) => {
                const valor = Number.parseInt(row.valor, 10);
                const esAlerta = Number.isFinite(valor) && valor > 0;
                return (
                  <MobileDataCard
                    key={row.orden}
                    title={row.metrica}
                    badge={
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          esAlerta
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-800",
                        )}
                      >
                        {row.valor}
                      </span>
                    }
                  >
                    <MobileDataRow label="Afecta a" value={row.afecta_a} />
                  </MobileDataCard>
                );
              })}
              {alertas.length === 0 && (
                <p className="py-8 text-center text-sm text-geo-muted">
                  No hay alertas de calidad abiertas en el padrón.
                </p>
              )}
            </div>
          }
        >
          <table className="mt-6 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-geo-border text-xs uppercase tracking-wide text-geo-muted">
                <th className="pb-3 pr-4 font-semibold">Métrica</th>
                <th className="pb-3 pr-4 font-semibold">Valor</th>
                <th className="pb-3 font-semibold">Afecta a</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((row) => {
                const valor = Number.parseInt(row.valor, 10);
                const esAlerta = Number.isFinite(valor) && valor > 0;
                return (
                  <tr
                    key={row.orden}
                    className="border-b border-geo-border last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-geo-navy">{row.metrica}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          esAlerta
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-800",
                        )}
                      >
                        {row.valor}
                      </span>
                    </td>
                    <td className="py-3 text-geo-muted">{row.afecta_a}</td>
                  </tr>
                );
              })}
              {alertas.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-geo-muted">
                    No hay alertas de calidad abiertas en el padrón.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>
    </section>
  );
}
