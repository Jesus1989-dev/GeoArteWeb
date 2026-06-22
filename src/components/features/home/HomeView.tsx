import Link from "next/link";
import { Info } from "lucide-react";
import { HomeHeroSearch } from "@/components/features/home/HomeHeroSearch";
import { HomeKpiPanel } from "@/components/features/home/HomeKpiPanel";
import { InfrastructureMonitoringSection } from "@/components/features/home/InfrastructureMonitoringSection";
import { SpatialExplorerBlock } from "@/components/features/home/SpatialExplorerBlock";
import { Button } from "@/components/shared/Button";
import { HomeQuickAccess } from "@/components/features/home/HomeQuickAccess";
import type { HomePageData } from "@/lib/services/home.service";

type HomeViewProps = {
  data: HomePageData;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function HomeView({ data, refreshing = false, onRefresh }: HomeViewProps) {
  const {
    brechaAlcaldias,
    busquedaAlcaldias,
    growthData,
    homeStats,
    kpiPorAlcaldia,
    quickAccess,
    spatialExplorer,
    monitoreoActualizadoEl,
    dataSource,
  } = data;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-geo-border bg-geo-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-geo-border bg-geo-card px-3 py-1.5 text-xs font-medium text-geo-navy sm:px-4">
                Plataforma de Inteligencia Territorial
              </span>

              <h1 className="mt-4 text-[1.65rem] font-extrabold leading-[1.15] tracking-tight text-geo-navy sm:mt-5 sm:text-4xl lg:text-5xl">
                Visualización y Análisis de la{" "}
                <span className="text-geo-pink">Infraestructura Cultural</span>{" "}
                en CDMX
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-geo-muted sm:mt-5 sm:text-base">
                Consulte, analice y genere reportes detallados sobre los
                espacios culturales y de investigación de las 16 alcaldías para
                fortalecer el diseño de políticas públicas.
              </p>

              <div className="mt-6 sm:mt-8">
                <HomeHeroSearch alcaldias={busquedaAlcaldias} />
              </div>
            </div>

            <HomeKpiPanel
              globalStats={homeStats}
              kpiPorAlcaldia={kpiPorAlcaldia}
              dataSource={dataSource}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          </div>
        </div>
      </section>

      {/* Explorador + accesos directos */}
      <section className="bg-geo-surface py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <SpatialExplorerBlock data={spatialExplorer} />
            </div>

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-geo-navy">
                  Accesos Directos
                </h2>
                <p className="mt-0.5 text-sm text-geo-muted">
                  Módulos principales del sistema
                </p>
              </div>
              <HomeQuickAccess items={quickAccess} />

              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-800/50 dark:bg-geo-surface">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-300 bg-white text-sky-600 dark:border-sky-600 dark:bg-geo-navy dark:text-sky-300">
                    <Info className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-geo-navy dark:text-foreground">
                      ¿Necesitas ayuda?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-geo-muted">
                      Consulta la documentación técnica o los tutoriales de uso
                      de las herramientas GIS.
                    </p>
                    <Link
                      href="/contacto"
                      className="mt-2 inline-block text-xs font-semibold text-geo-pink hover:underline"
                    >
                      Ver Documentación
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InfrastructureMonitoringSection
        growthData={[...growthData]}
        brechaAlcaldias={brechaAlcaldias}
        actualizadoEl={monitoreoActualizadoEl}
      />

      {/* CTA */}
      <section className="bg-geo-navy py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Impulse sus decisiones con datos confiables
          </h2>
          <p className="mt-4 text-sky-100">
            Acceda a indicadores verificados, mapas interactivos y reportes
            técnicos para la toma de decisiones en política cultural.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contacto" variant="primary">
              Contactar Soporte
            </Button>
            <Button
              href="/sobre-el-proyecto"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Saber más del Proyecto
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
