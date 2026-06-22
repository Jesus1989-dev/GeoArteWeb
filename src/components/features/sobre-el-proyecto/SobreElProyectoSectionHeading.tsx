import type { LucideIcon } from "lucide-react";

type SobreElProyectoSectionHeadingProps = {
  icon: LucideIcon;
  titulo: string;
  subtitulo?: string;
};

export function SobreElProyectoSectionHeading({
  icon: Icon,
  titulo,
  subtitulo,
}: SobreElProyectoSectionHeadingProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-geo-pink" strokeWidth={1.75} aria-hidden />
        <h2 className="text-xl font-bold text-geo-navy">{titulo}</h2>
      </div>
      <div className="mt-2 h-1 w-12 rounded-full bg-geo-pink" aria-hidden />
      {subtitulo != null && subtitulo !== "" && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-geo-muted">
          {subtitulo}
        </p>
      )}
    </div>
  );
}
