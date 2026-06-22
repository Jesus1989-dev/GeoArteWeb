import { SobreElProyectoDatosCta } from "@/components/features/sobre-el-proyecto/SobreElProyectoDatosCta";
import { SobreElProyectoHero } from "@/components/features/sobre-el-proyecto/SobreElProyectoHero";
import { SobreElProyectoFuentesSection } from "@/components/features/sobre-el-proyecto/SobreElProyectoFuentesSection";
import { SobreElProyectoMetodologiaSection } from "@/components/features/sobre-el-proyecto/SobreElProyectoMetodologiaSection";
import { SobreElProyectoObjetivosSection } from "@/components/features/sobre-el-proyecto/SobreElProyectoObjetivosSection";
import { SobreElProyectoSidebar } from "@/components/features/sobre-el-proyecto/SobreElProyectoSidebar";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

type SobreElProyectoViewProps = {
  data: SobreElProyectoPageData;
};

export function SobreElProyectoView({ data }: SobreElProyectoViewProps) {
  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-white">
      <SobreElProyectoHero hero={data.sobreElProyectoHero} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="space-y-16">
            <SobreElProyectoObjetivosSection
              section={data.objetivosSection}
              objetivos={data.objetivosEstrategicos}
            />
            <SobreElProyectoMetodologiaSection
              section={data.metodologiaSection}
              pasos={data.pasosMetodologia}
            />
            <SobreElProyectoFuentesSection
              section={data.fuentesSection}
              fuentes={data.fuentesInformacion}
              dataSource={data.dataSource}
              dataSourceNote={data.dataSourceNote}
            />
          </div>

          <SobreElProyectoSidebar
            data={{
              equipoSection: data.equipoSection,
              equipoCore: data.equipoCore,
              colaboradoresSection: data.colaboradoresSection,
              colaboradores: data.colaboradores,
              licenciaDatos: data.licenciaDatos,
            }}
          />
        </div>
      </div>

      <SobreElProyectoDatosCta cta={data.datosCrudosCta} />
    </div>
  );
}
