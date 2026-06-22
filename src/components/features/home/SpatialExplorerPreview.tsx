import {
  BookOpen,
  Building2,
  Compass,
  GraduationCap,
  Landmark,
  Library,
  Mic2,
  Play,
  Theater,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EspacioTipo } from "@/lib/domain/mapa";
import type { SpatialExplorerPreviewData } from "@/lib/domain/home";
import { cn } from "@/lib/utils";

const TIPO_ICONS: Partial<Record<EspacioTipo, LucideIcon>> = {
  museos: Landmark,
  teatros: Theater,
  auditorios: Mic2,
  bibliotecas: Library,
  bibliotecasDgb: BookOpen,
  universidades: GraduationCap,
};

const FALLBACK_ICONS: LucideIcon[] = [Building2, Library, Theater, Landmark];

function GoldPin({
  Icon,
  pinId,
  compact = false,
}: {
  Icon: LucideIcon;
  pinId: string;
  compact?: boolean;
}) {
  const gradId = `pin-${pinId}`;
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-300/50 blur-md",
          compact ? "h-3 w-3" : "h-4 w-4",
        )}
        aria-hidden
      />
      <svg
        viewBox="0 0 32 44"
        className={cn(
          "relative drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]",
          compact ? "h-8 w-6" : "h-11 w-8",
        )}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <path
          d="M16 2 C24 2 30 10 30 18 C30 28 16 42 16 42 C16 42 2 28 2 18 C2 10 8 2 16 2 Z"
          fill={`url(#${gradId})`}
          stroke="#92400e"
          strokeWidth="0.6"
        />
        <circle cx="16" cy="16" r="7" fill="#1e293b" opacity="0.15" />
        <circle cx="16" cy="16" r="6" fill="#fef3c7" />
      </svg>
      <Icon
        className={cn(
          "absolute left-1/2 -translate-x-1/2 text-amber-900",
          compact ? "top-[20%] h-3 w-3" : "top-[22%] h-3.5 w-3.5",
        )}
        strokeWidth={2.2}
      />
    </div>
  );
}

const MOBILE_MAX_PINS = 4;

function PreviewLegend({
  legend,
  variant,
}: {
  legend: SpatialExplorerPreviewData["legend"];
  variant: "overlay" | "mobile";
}) {
  return (
    <div
      className={cn(
        variant === "overlay" &&
          "absolute left-3 top-3 z-10 hidden max-w-[min(46%,13rem)] space-y-1.5 rounded-lg border border-white/10 bg-slate-900/75 px-3 py-2.5 text-[10px] shadow-lg shadow-black/40 backdrop-blur-md sm:left-4 sm:top-4 sm:block sm:max-w-none",
        variant === "mobile" &&
          "grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/10 px-3 py-3 text-[11px] sm:hidden",
      )}
    >
      {legend.map((item) => (
        <div key={item.tipo} className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.35)]",
              variant === "overlay" ? "h-2 w-2" : "h-2.5 w-2.5",
              item.dotClassName,
            )}
          />
          <span
            className="min-w-0 truncate font-semibold text-slate-200"
            title={`${item.label}${item.count > 0 ? ` (${item.count.toLocaleString("es-MX")})` : ""}`}
          >
            {item.label}
            {item.count > 0 ? ` (${item.count.toLocaleString("es-MX")})` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

type SpatialExplorerPreviewProps = {
  data: SpatialExplorerPreviewData;
  className?: string;
};

/** Vista ilustrada del Explorador Espacial con pines georreferenciados. */
export function SpatialExplorerPreview({ data, className }: SpatialExplorerPreviewProps) {
  const { pins, legend, subtitle } = data;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f1a] via-[#0f1729] to-[#131c33] shadow-[0_12px_48px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(251,191,36,0.12)] ring-1 ring-amber-500/35 ring-inset",
        className,
      )}
    >
      <div className="relative aspect-[4/5] min-h-[17.5rem] overflow-hidden sm:aspect-[16/10] sm:min-h-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_60%,rgba(225,5,153,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(34,211,238,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_25%,rgba(168,85,247,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_0%,rgba(30,58,95,0.5),transparent_70%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="islandTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a7394" />
            <stop offset="50%" stopColor="#3d5575" />
            <stop offset="100%" stopColor="#1f3a5f" />
          </linearGradient>
          <linearGradient id="islandSide" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2f4a" />
            <stop offset="100%" stopColor="#0f1a2a" />
          </linearGradient>
          <filter id="underGlow" x="-30%" y="-20%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.9  0 0.3 1 0 0.5  0 0.8 1 0 0.9  0 0 0 0.7 0"
            />
          </filter>
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="islandShadow" x="-15%" y="-10%" width="130%" height="140%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="8"
              floodColor="#0f172a"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        <ellipse
          cx="200"
          cy="210"
          rx="150"
          ry="28"
          fill="#e10599"
          opacity="0.5"
          filter="url(#underGlow)"
        />
        <ellipse
          cx="175"
          cy="215"
          rx="90"
          ry="18"
          fill="#22d3ee"
          opacity="0.45"
          filter="url(#underGlow)"
        />
        <ellipse
          cx="240"
          cy="212"
          rx="70"
          ry="14"
          fill="#a855f7"
          opacity="0.4"
          filter="url(#underGlow)"
        />

        <ellipse cx="42" cy="182" rx="26" ry="12" fill="url(#islandSide)" />
        <ellipse
          cx="42"
          cy="178"
          rx="26"
          ry="12"
          fill="url(#islandTop)"
          filter="url(#islandShadow)"
        />

        <path
          d="M 62 198 Q 65 188 105 205 Q 160 222 220 212 Q 290 220 335 198 Q 358 188 358 175 Q 362 175 320 200 Q 280 225 160 218 Q 70 210 62 198 Z"
          fill="url(#islandSide)"
        />

        <path
          d="M 60 128 Q 54 92 92 84 Q 125 68 168 76 Q 215 62 258 72 Q 298 66 332 84 Q 362 96 360 134 Q 364 172 322 192 Q 278 210 218 200 Q 158 212 102 194 Q 62 182 60 128 Z"
          fill="url(#islandTop)"
          stroke="#1f3a5f"
          strokeWidth="0.8"
          filter="url(#islandShadow)"
        />

        <g stroke="#6b8ab5" strokeWidth="1.2" strokeLinecap="round" opacity="0.4">
          <line x1="68" y1="112" x2="348" y2="115" />
          <line x1="66" y1="145" x2="354" y2="148" />
          <line x1="72" y1="178" x2="340" y2="181" />
          <line x1="102" y1="78" x2="106" y2="200" />
          <line x1="162" y1="72" x2="166" y2="206" />
          <line x1="222" y1="68" x2="226" y2="204" />
          <line x1="282" y1="74" x2="285" y2="198" />
          <line x1="130" y1="95" x2="300" y2="175" opacity="0.35" />
        </g>

        <ellipse cx="128" cy="136" rx="36" ry="18" fill="#22c55e" opacity="0.55" />
        <ellipse cx="108" cy="126" rx="16" ry="10" fill="#4ade80" opacity="0.65" />
        <ellipse cx="150" cy="146" rx="12" ry="8" fill="#4ade80" opacity="0.6" />
        <ellipse cx="248" cy="182" rx="30" ry="14" fill="#22c55e" opacity="0.55" />
        <ellipse cx="235" cy="175" rx="12" ry="7" fill="#4ade80" opacity="0.65" />
        <ellipse cx="322" cy="178" rx="20" ry="10" fill="#22c55e" opacity="0.5" />

        <path
          d="M 88 152 Q 148 128 202 162 T 318 142"
          stroke="#e10599"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#routeGlow)"
          opacity="1"
        />
        <path
          d="M 78 176 Q 162 156 222 170 T 328 176"
          stroke="#4d6d94"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#routeGlow)"
          opacity="1"
        />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 px-3 text-center sm:top-5 sm:px-4">
        <p className="text-sm font-bold tracking-[0.12em] text-slate-200 sm:text-lg sm:tracking-[0.18em] md:text-xl">
          MEXICO CITY
        </p>
        <p className="mt-0.5 text-[9px] font-semibold tracking-[0.22em] text-amber-400 sm:text-[10px] sm:tracking-[0.32em] md:text-xs">
          CULTURAL JOURNEY
        </p>
        <p className="mt-1 hidden text-[10px] text-slate-400 sm:block sm:text-[11px]">
          {subtitle}
        </p>
      </div>

      <PreviewLegend legend={legend} variant="overlay" />

      {pins.map((pin, index) => (
        <div
          key={pin.id}
          className={cn(
            "absolute z-10 -translate-x-1/2 -translate-y-full origin-bottom transition-transform duration-300 group-hover:-translate-y-[108%] max-sm:scale-[0.72]",
            index >= MOBILE_MAX_PINS && "hidden sm:block",
          )}
          style={{ top: pin.top, left: pin.left }}
          title={pin.nombre}
        >
          <GoldPin
            Icon={TIPO_ICONS[pin.tipo] ?? FALLBACK_ICONS[index % FALLBACK_ICONS.length]}
            pinId={pin.id.slice(0, 8)}
          />
        </div>
      ))}

      <div className="absolute bottom-2.5 left-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-slate-900/70 text-amber-400 shadow-lg shadow-black/50 backdrop-blur-md sm:bottom-4 sm:left-4 sm:h-12 sm:w-12">
        <Compass className="h-5 w-5 text-amber-400 sm:h-7 sm:w-7" strokeWidth={1.4} />
        <span className="sr-only">Brújula</span>
      </div>

      <div className="absolute bottom-2.5 right-2.5 z-10 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-to-br from-geo-pink via-geo-navy to-geo-navy text-white shadow-[0_4px_24px_rgba(225,5,153,0.45)] ring-2 ring-amber-400/40 transition-transform duration-300 group-hover:scale-105 sm:bottom-4 sm:right-4 sm:h-[4.25rem] sm:w-[4.25rem]">
        <Play className="h-3.5 w-3.5 fill-white text-white sm:h-4 sm:w-4" strokeWidth={0} />
        <span className="mt-0.5 text-[6px] font-bold tracking-[0.16em] text-white/95 sm:text-[7px] sm:tracking-[0.2em]">
          EXPLORE
        </span>
      </div>
      </div>

      <PreviewLegend legend={legend} variant="mobile" />
      <p className="px-3 pb-3 text-center text-[10px] text-slate-400 sm:hidden">{subtitle}</p>
    </div>
  );
}
