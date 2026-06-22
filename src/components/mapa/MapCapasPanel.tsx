"use client";

import { useEffect, useState } from "react";
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Drama,
  Eye,
  Film,
  Globe2,
  GraduationCap,
  Home,
  Image,
  Info,
  Landmark,
  Library,
  Mic2,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  TrainFront,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { CapaMapaState, EspacioTipo } from "@/lib/domain/mapa";
import type { mapaCapasSecciones } from "@/lib/data/mock/mapa";
import { cn } from "@/lib/utils";

type CapaDef = (typeof mapaCapasSecciones)[number]["capas"][number];
type CapaIcon = CapaDef["icon"];

const capaIcons: Record<CapaIcon, LucideIcon> = {
  mic: Mic2,
  library: Library,
  bookOpen: BookOpen,
  palette: Palette,
  home: Home,
  globe: Globe2,
  film: Film,
  image: Image,
  bookMarked: BookMarked,
  landmark: Landmark,
  drama: Drama,
  graduationCap: GraduationCap,
  train: TrainFront,
  usersGroup: UsersRound,
  info: Info,
  eye: Eye,
};

type MapCapasPanelProps = {
  titulo: string;
  capaBaseActiva: string;
  resetLabel: string;
  territorialFuente?: string;
  secciones: typeof mapaCapasSecciones;
  capaMapa: CapaMapaState;
  onCapaMapaChange: (
    tipo: EspacioTipo,
    patch: Partial<{ visible: boolean; opacity: number }>,
  ) => void;
  capasExtra: Record<string, boolean>;
  onCapaExtraChange: (id: string, visible: boolean) => void;
  onReset: () => void;
};

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-geo-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3.5 text-left text-sm font-semibold text-geo-navy"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-geo-muted transition-transform",
            !open && "-rotate-90",
          )}
          aria-hidden
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function LayerItem({
  capa,
  checked,
  onCheckedChange,
  opacity,
  onOpacityChange,
}: {
  capa: CapaDef;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
}) {
  const Icon = capaIcons[capa.icon];
  const showOpacity = capa.conOpacidad && checked && opacity != null;

  return (
    <div className="border-b border-geo-border/80 py-3 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy">
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold leading-tight text-geo-navy">
            {capa.label}
          </p>
          {capa.subtitulo != null && (
            <p className="mt-0.5 text-xs leading-snug text-geo-muted">
              {capa.subtitulo}
            </p>
          )}
        </div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-geo-border text-geo-pink focus:ring-geo-pink/30"
          aria-label={capa.label}
        />
      </div>
      {showOpacity && onOpacityChange != null && (
        <div className="mt-3 pl-12">
          <div className="flex items-center justify-between text-xs text-geo-muted">
            <span>Opacidad</span>
            <span>{opacity}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={100}
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="mt-1.5 w-full accent-geo-pink"
          />
        </div>
      )}
    </div>
  );
}

export function MapCapasPanel({
  titulo,
  capaBaseActiva,
  resetLabel,
  territorialFuente,
  secciones,
  capaMapa,
  onCapaMapaChange,
  capasExtra,
  onCapaExtraChange,
  onReset,
}: MapCapasPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      if (mq.matches) setCollapsed(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <aside
      className={cn(
        "order-2 flex shrink-0 flex-col overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm transition-[width] duration-200 lg:order-1",
        collapsed ? "w-full lg:w-12" : "w-full lg:w-72",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-geo-border bg-geo-surface",
          collapsed ? "justify-between gap-2 px-3 py-3 lg:justify-center lg:px-2" : "justify-between gap-2 px-4 py-3",
        )}
      >
        {collapsed ? (
          <>
            <span className="truncate text-sm font-bold text-geo-navy lg:hidden">{titulo}</span>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="shrink-0 rounded-md p-1 text-geo-muted transition hover:bg-geo-card/80 hover:text-geo-navy lg:mx-auto"
              aria-expanded={!collapsed}
              aria-label="Expandir control de capas"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </>
        ) : (
          <>
        <div className="flex min-w-0 items-center gap-2.5">
          <SlidersHorizontal
            className="h-5 w-5 shrink-0 text-geo-navy"
            strokeWidth={1.75}
            aria-hidden
          />
          <h2 className="truncate text-sm font-bold text-geo-navy">{titulo}</h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="shrink-0 rounded-md p-1 text-geo-muted transition hover:bg-geo-card/80 hover:text-geo-navy"
          aria-expanded={!collapsed}
          aria-label="Colapsar control de capas"
        >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
          </>
        )}
      </div>

      {!collapsed && (
      <>
      <div className="max-h-[min(70vh,560px)] flex-1 overflow-y-auto px-3 lg:max-h-none">
        {secciones.map((seccion) => (
          <CollapsibleSection
            key={seccion.id}
            title={seccion.titulo}
            defaultOpen={seccion.defaultOpen}
          >
            {seccion.capas.map((capa) => {
              if (capa.mapKey != null) {
                const estado = capaMapa[capa.mapKey];
                return (
                  <LayerItem
                    key={capa.id}
                    capa={capa}
                    checked={estado.visible}
                    onCheckedChange={(v) =>
                      onCapaMapaChange(capa.mapKey!, { visible: v })
                    }
                    opacity={estado.opacity}
                    onOpacityChange={(v) =>
                      onCapaMapaChange(capa.mapKey!, { opacity: v })
                    }
                  />
                );
              }
              return (
                <LayerItem
                  key={capa.id}
                  capa={capa}
                  checked={capasExtra[capa.id] ?? false}
                  onCheckedChange={(v) => onCapaExtraChange(capa.id, v)}
                />
              );
            })}
          </CollapsibleSection>
        ))}
      </div>

      <div className="mt-auto space-y-3 border-t border-geo-border p-4">
        {territorialFuente && (
          <p className="text-[11px] leading-snug text-geo-muted">{territorialFuente}</p>
        )}
        <p className="text-xs italic text-geo-muted">{capaBaseActiva}</p>
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-geo-border bg-geo-card py-2.5 text-sm font-medium text-geo-navy transition hover:bg-geo-surface"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {resetLabel}
        </button>
      </div>
      </>
      )}
    </aside>
  );
}
