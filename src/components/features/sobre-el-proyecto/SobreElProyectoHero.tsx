import { Layers } from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

type SobreElProyectoHeroProps = {
  hero: SobreElProyectoPageData["sobreElProyectoHero"];
};

export function SobreElProyectoHero({ hero }: SobreElProyectoHeroProps) {
  return (
    <section className="border-b border-geo-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-geo-pink px-3 py-1 text-xs font-semibold text-geo-pink">
              {hero.badge}
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-geo-navy sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
              {hero.tituloAntes}{" "}
              <span className="text-geo-pink">{hero.tituloDestacado}</span>{" "}
              {hero.tituloDespues}
            </h1>

            <p className="mt-6 border-l-4 border-geo-pink pl-5 text-base italic leading-relaxed text-gray-600 sm:text-lg">
              {hero.descripcion}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={hero.btnMapaHref} variant="primary">
                {hero.btnMapa}
              </Button>
              <Button
                href={hero.btnMetodologiaHref}
                variant="outline-navy"
              >
                {hero.btnMetodologia}
              </Button>
            </div>
          </div>

          <div
            className="relative hidden items-center justify-center lg:flex lg:pr-8"
            aria-hidden
          >
            <Layers
              className="h-56 w-56 text-gray-200/90 sm:h-64 sm:w-64"
              strokeWidth={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
