import {
  Database,
  FileSearch,
  MapPin,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";
import { SobreElProyectoSectionHeading } from "@/components/features/sobre-el-proyecto/SobreElProyectoSectionHeading";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

const iconMap: Record<
  SobreElProyectoPageData["objetivosEstrategicos"][number]["icon"],
  LucideIcon
> = {
  mapPin: MapPin,
  brecha: FileSearch,
  database: Database,
  shield: ShieldCheck,
};

type SobreElProyectoObjetivosSectionProps = {
  section: SobreElProyectoPageData["objetivosSection"];
  objetivos: SobreElProyectoPageData["objetivosEstrategicos"];
};

export function SobreElProyectoObjetivosSection({
  section,
  objetivos,
}: SobreElProyectoObjetivosSectionProps) {
  return (
    <section>
      <SobreElProyectoSectionHeading
        icon={Target}
        titulo={section.titulo}
        subtitulo={section.subtitulo}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {objetivos.map((obj) => {
          const Icon = iconMap[obj.icon];
          return (
            <div
              key={obj.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-geo-pink shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mt-4 font-bold text-geo-navy">{obj.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-geo-muted">
                {obj.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
