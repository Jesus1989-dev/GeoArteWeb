"use client";

import { useCallback, useMemo, useState } from "react";
import { PoliticasEvidenciaSection } from "@/components/features/politicas/PoliticasEvidenciaSection";
import { PoliticasHero } from "@/components/features/politicas/PoliticasHero";
import { PoliticasRecomendacionesSection } from "@/components/features/politicas/PoliticasRecomendacionesSection";
import type { FiltroObjetivoId } from "@/lib/domain/politicas";
import {
  downloadPoliticasBrief,
  downloadPoliticasInforme,
  findSeccionTituloForAccion,
} from "@/lib/politicas/export-politicas";
import { Button } from "@/components/shared/Button";
import type { PoliticasPageData } from "@/lib/services/politicas.service";
import { ArrowRight } from "lucide-react";

type PoliticasViewProps = {
  data: PoliticasPageData;
};

export function PoliticasView({ data }: PoliticasViewProps) {
  const {
    politicasHero,
    politicasHeroStats,
    evidenciaDiagnosticoContenido,
    brechaInversionAlcaldias,
    filtrosObjetivo,
    recomendacionesPorObjetivo,
    politicasCta,
    dataSource,
    dataSourceNote,
    anioCorte,
  } = data;

  const [filtroObjetivo, setFiltroObjetivo] = useState<FiltroObjetivoId>("todos");
  const [exportingId, setExportingId] = useState<string | null>(null);

  const seccionesVisibles = useMemo(() => {
    if (filtroObjetivo === "todos") return recomendacionesPorObjetivo;
    return recomendacionesPorObjetivo.filter((s) => s.id === filtroObjetivo);
  }, [filtroObjetivo, recomendacionesPorObjetivo]);

  const totalRecomendaciones = useMemo(
    () => seccionesVisibles.reduce((n, s) => n + s.acciones.length, 0),
    [seccionesVisibles],
  );

  const handleDownloadInforme = useCallback(async () => {
    setExportingId("informe");
    try {
      await downloadPoliticasInforme({
        anioCorte,
        dataSourceNote,
        stats: politicasHeroStats,
        evidencia: evidenciaDiagnosticoContenido,
        brechaChart: brechaInversionAlcaldias,
        secciones: recomendacionesPorObjetivo,
      });
    } finally {
      setExportingId(null);
    }
  }, [
    anioCorte,
    dataSourceNote,
    politicasHeroStats,
    evidenciaDiagnosticoContenido,
    brechaInversionAlcaldias,
    recomendacionesPorObjetivo,
  ]);

  const handleDownloadBrief = useCallback(
    async (accionId: string) => {
      setExportingId(accionId);
      try {
        const accion = recomendacionesPorObjetivo
          .flatMap((s) => s.acciones)
          .find((a) => a.id === accionId);
        if (!accion) return;
        const seccionTitulo = findSeccionTituloForAccion(
          recomendacionesPorObjetivo,
          accionId,
        );
        await downloadPoliticasBrief(accion, seccionTitulo, anioCorte);
      } finally {
        setExportingId(null);
      }
    },
    [recomendacionesPorObjetivo, anioCorte],
  );

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface pb-14">
      <PoliticasHero
        hero={politicasHero}
        stats={politicasHeroStats}
        onDownloadInforme={handleDownloadInforme}
        downloadingInforme={exportingId === "informe"}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {dataSourceNote && (
          <p className="mb-6 text-xs text-geo-muted">
            {dataSource === "supabase" ? "● " : "○ "}
            {dataSourceNote}
          </p>
        )}

        <PoliticasEvidenciaSection
          contenido={evidenciaDiagnosticoContenido}
          brechaInversionAlcaldias={brechaInversionAlcaldias}
          filtrosObjetivo={filtrosObjetivo}
          filtroObjetivo={filtroObjetivo}
          onFiltroObjetivoChange={setFiltroObjetivo}
          recomendacionesVisibles={totalRecomendaciones}
        />

        <PoliticasRecomendacionesSection
          secciones={seccionesVisibles}
          onDownloadBrief={handleDownloadBrief}
          downloadingBriefId={exportingId}
        />
      </div>

      <section className="mt-14 bg-geo-navy py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {politicasCta.titulo}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/90 sm:text-base">
            {politicasCta.descripcion}
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              href={politicasCta.href}
              variant="primary"
              size="lg"
              className="gap-2 px-8"
            >
              {politicasCta.boton}
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
