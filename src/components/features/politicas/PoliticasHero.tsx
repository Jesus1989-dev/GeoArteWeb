import {
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  UserPlus,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { PoliticasPageData } from "@/lib/services/politicas.service";

const statIcons = {
  zap: Zap,
  users: UserPlus,
  dollar: DollarSign,
  mapPin: MapPin,
} satisfies Record<
  PoliticasPageData["politicasHeroStats"][number]["icon"],
  LucideIcon
>;

type PoliticasHeroProps = {
  hero: PoliticasPageData["politicasHero"];
  stats: PoliticasPageData["politicasHeroStats"];
  onDownloadInforme: () => void | Promise<void>;
  downloadingInforme?: boolean;
};

export function PoliticasHero({
  hero,
  stats,
  onDownloadInforme,
  downloadingInforme = false,
}: PoliticasHeroProps) {
  return (
    <section className="border-b border-geo-border bg-geo-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <span className="inline-flex rounded-full border border-geo-border bg-white px-3 py-1 text-xs font-medium text-geo-muted">
              {hero.badge}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              <span className="block text-geo-navy">{hero.tituloLinea1}</span>
              <span className="block text-geo-pink">{hero.tituloLinea2}</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-geo-muted sm:text-base">
              {hero.descripcion}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="primary"
                className="gap-2"
                disabled={downloadingInforme}
                onClick={() => void onDownloadInforme()}
              >
                {downloadingInforme ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <FileText className="h-4 w-4" strokeWidth={2} />
                )}
                {downloadingInforme ? "Generando PDF…" : "Descargar Informe Global"}
              </Button>
              <Button
                href="/sobre-el-proyecto#metodologia"
                variant="outline"
                className="border-geo-navy text-geo-navy hover:bg-white"
              >
                Consultar Metodología
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => {
              const Icon = statIcons[s.icon];
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center rounded-xl border border-geo-border bg-white px-4 py-6 text-center shadow-sm"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-geo-pink text-white shadow-sm">
                    <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                  </span>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-geo-navy sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-geo-navy">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-xs text-geo-muted">{s.sublabel}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
