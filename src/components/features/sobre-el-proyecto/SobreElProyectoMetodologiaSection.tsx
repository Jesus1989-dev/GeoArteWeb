import { Layers } from "lucide-react";
import { SobreElProyectoSectionHeading } from "@/components/features/sobre-el-proyecto/SobreElProyectoSectionHeading";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

type SobreElProyectoMetodologiaSectionProps = {
  section: SobreElProyectoPageData["metodologiaSection"];
  pasos: SobreElProyectoPageData["pasosMetodologia"];
};

export function SobreElProyectoMetodologiaSection({
  section,
  pasos,
}: SobreElProyectoMetodologiaSectionProps) {
  return (
    <section id="metodologia" className="scroll-mt-24">
      <SobreElProyectoSectionHeading
        icon={Layers}
        titulo={section.titulo}
        subtitulo={section.subtitulo}
      />
      <p className="mt-6 text-sm leading-relaxed text-geo-muted sm:text-base">
        {section.intro}
      </p>
      <ol className="mt-8 space-y-4">
        {pasos.map((p) => (
          <li
            key={p.step}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-geo-navy text-sm font-bold text-white">
              {p.step}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-geo-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-geo-muted">
                {p.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
