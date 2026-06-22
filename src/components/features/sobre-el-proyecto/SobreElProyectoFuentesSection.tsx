import { BookOpen } from "lucide-react";
import { SobreElProyectoSectionHeading } from "@/components/features/sobre-el-proyecto/SobreElProyectoSectionHeading";
import { MobileDataCard } from "@/components/shared/MobileDataCard";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import type { FuenteInformacion } from "@/lib/domain/fuentes-informacion";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";
import { cn } from "@/lib/utils";

type SobreElProyectoFuentesSectionProps = {
  section: SobreElProyectoPageData["fuentesSection"];
  fuentes: FuenteInformacion[];
  dataSource?: SobreElProyectoPageData["dataSource"];
  dataSourceNote?: string;
};

const ESTADO_BADGE: Record<
  FuenteInformacion["tipoEstado"],
  string
> = {
  activo: "bg-emerald-600 text-white",
  api: "bg-sky-600 text-white",
  estatico: "bg-slate-500 text-white",
  procesado: "bg-violet-600 text-white",
};

export function SobreElProyectoFuentesSection({
  section,
  fuentes,
  dataSource,
  dataSourceNote,
}: SobreElProyectoFuentesSectionProps) {
  return (
    <section id="fuentes" className="scroll-mt-24">
      <SobreElProyectoSectionHeading icon={BookOpen} titulo={section.titulo} />

      {(dataSource != null || dataSourceNote) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {dataSource != null && (
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                dataSource === "supabase"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900",
              )}
            >
              {dataSource === "supabase" ? "Fuentes Supabase" : "Modo demo"}
            </span>
          )}
          {dataSourceNote && (
            <p className="text-xs text-geo-muted">{dataSourceNote}</p>
          )}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <ResponsiveTable
          mobile={
            <div className="divide-y divide-gray-100">
              {fuentes.map((row) => (
                <MobileDataCard
                  key={row.id}
                  title={
                    row.urlFuente ? (
                      <a
                        href={row.urlFuente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-geo-pink hover:underline"
                      >
                        {row.institucion}
                      </a>
                    ) : (
                      row.institucion
                    )
                  }
                  subtitle={row.dataset}
                  badge={
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        ESTADO_BADGE[row.tipoEstado],
                      )}
                    >
                      {row.estado}
                    </span>
                  }
                />
              ))}
              {fuentes.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-geo-muted">
                  No hay fuentes registradas.
                </p>
              )}
            </div>
          }
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-geo-muted">
                  Institución
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-geo-muted">
                  Dataset
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-geo-muted">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {fuentes.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-5 py-4 font-semibold text-geo-navy">
                    {row.urlFuente ? (
                      <a
                        href={row.urlFuente}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-geo-pink hover:underline"
                      >
                        {row.institucion}
                      </a>
                    ) : (
                      row.institucion
                    )}
                  </td>
                  <td className="px-5 py-4 text-geo-muted">{row.dataset}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        ESTADO_BADGE[row.tipoEstado],
                      )}
                    >
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {fuentes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-geo-muted">
                    No hay fuentes registradas.
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
