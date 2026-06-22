import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

type SobreElProyectoDatosCtaProps = {
  cta: SobreElProyectoPageData["datosCrudosCta"];
};

export function SobreElProyectoDatosCta({ cta }: SobreElProyectoDatosCtaProps) {
  return (
    <section className="bg-geo-navy py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{cta.titulo}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/90 sm:text-base">
          {cta.descripcion}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            href={cta.btnApiHref}
            variant="primary"
            size="lg"
            className="w-full gap-2 px-8 sm:w-auto"
          >
            {cta.btnApi}
            <ArrowRight className="h-5 w-5" strokeWidth={2} />
          </Button>
          <Link
            href={cta.btnRepositorioHref}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 bg-white/10 px-8 py-3 text-base font-medium text-white transition hover:bg-white/15 sm:w-auto"
          >
            {cta.btnRepositorio}
          </Link>
        </div>
      </div>
    </section>
  );
}
