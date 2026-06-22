import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  Fingerprint,
  Globe,
  MessageCircle,
  Mountain,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SobreElProyectoPageData } from "@/lib/services/sobre-el-proyecto.service";

const colaboradorIcons: Record<
  SobreElProyectoPageData["colaboradores"][number]["icon"],
  LucideIcon
> = {
  fingerprint: Fingerprint,
  messages: MessageCircle,
  mountain: Mountain,
  globe: Globe,
};

type SobreElProyectoSidebarProps = {
  data: Pick<
    SobreElProyectoPageData,
    | "equipoSection"
    | "equipoCore"
    | "colaboradoresSection"
    | "colaboradores"
    | "licenciaDatos"
  >;
};

export function SobreElProyectoSidebar({ data }: SobreElProyectoSidebarProps) {
  const {
    equipoSection,
    equipoCore,
    colaboradoresSection,
    colaboradores,
    licenciaDatos,
  } = data;

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-geo-pink" strokeWidth={2} aria-hidden />
          <h3 className="font-bold text-geo-navy">{equipoSection.titulo}</h3>
        </div>
        <ul className="mt-5 space-y-5">
          {equipoCore.map((m) => (
            <li key={m.name} className="flex gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-geo-navy ring-1 ring-gray-200">
                {m.initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-geo-navy">{m.name}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-geo-pink">
                  {m.role}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-geo-muted">
                  {m.bio}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href={equipoSection.linkEquipoHref}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-geo-pink hover:underline"
        >
          {equipoSection.linkEquipo}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-geo-navy">
            {colaboradoresSection.titulo}
          </h3>
          <span
            className="h-2 w-2 rounded-sm bg-geo-pink"
            aria-hidden
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {colaboradores.map((c) => {
            const Icon = colaboradorIcons[c.icon];
            return (
              <div
                key={c.id}
                className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-4 text-center"
              >
                <Icon
                  className="h-7 w-7 text-gray-400"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500">
                  {c.nombre}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-geo-navy p-5 text-white shadow-sm sm:p-6">
        <Shield
          className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-white/5"
          strokeWidth={1}
          aria-hidden
        />
        <h3 className="relative font-bold">{licenciaDatos.titulo}</h3>
        <p className="relative mt-3 text-sm leading-relaxed text-sky-100/90">
          {licenciaDatos.descripcion}
        </p>
        <div className="relative mt-5 flex flex-col gap-2">
          <Link
            href={licenciaDatos.btnAtribucionHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            {licenciaDatos.btnAtribucion}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
          <Link
            href={licenciaDatos.btnTerminosHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            {licenciaDatos.btnTerminos}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
