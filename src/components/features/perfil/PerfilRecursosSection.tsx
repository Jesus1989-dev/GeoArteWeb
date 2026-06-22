"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PerfilRecursoCard } from "@/components/features/perfil/PerfilRecursoCard";
import { Button } from "@/components/shared/Button";
import type { PerfilEspacioGuardado } from "@/lib/domain/perfil";
import type { PerfilPageData } from "@/lib/services/perfil.service";
import { cn } from "@/lib/utils";

type PerfilRecursosSectionProps = {
  espacios: PerfilEspacioGuardado[];
  meta: PerfilPageData["perfilRecursosMeta"];
  onEliminarEspacio?: (espacioId: string) => void;
  eliminandoId?: string | null;
};

export function PerfilRecursosSection({
  espacios,
  meta,
  onEliminarEspacio,
  eliminandoId,
}: PerfilRecursosSectionProps) {
  const [filtro, setFiltro] = useState<string>("todos");
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const filtroRef = useRef<HTMLDivElement>(null);

  const filtroOpciones = useMemo(() => {
    const tipos = [...new Set(espacios.map((e) => e.tipo))].sort((a, b) =>
      a.localeCompare(b, "es"),
    );
    return [
      { value: "todos", label: "Todos los tipos" },
      ...tipos.map((tipo) => ({ value: tipo, label: tipo })),
    ];
  }, [espacios]);

  useEffect(() => {
    if (!filtroOpciones.some((o) => o.value === filtro)) {
      setFiltro("todos");
    }
  }, [filtro, filtroOpciones]);

  useEffect(() => {
    if (!filtroAbierto) return;
    function handleClick(e: MouseEvent) {
      if (
        filtroRef.current &&
        !filtroRef.current.contains(e.target as Node)
      ) {
        setFiltroAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filtroAbierto]);

  const filtrados = useMemo(() => {
    if (filtro === "todos") return [...espacios];
    return espacios.filter((e) => e.tipo === filtro);
  }, [filtro, espacios]);

  const filtroActivo =
    filtroOpciones.find((o) => o.value === filtro) ?? filtroOpciones[0];

  return (
    <section aria-labelledby="perfil-recursos-titulo">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="perfil-recursos-titulo"
            className="text-xl font-bold text-geo-navy sm:text-2xl"
          >
            {meta.titulo}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-geo-muted">{meta.subtitulo}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {filtroOpciones.length > 1 && (
            <div ref={filtroRef} className="relative">
              <button
                type="button"
                onClick={() => setFiltroAbierto((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-geo-navy shadow-sm transition hover:border-gray-300"
                aria-expanded={filtroAbierto}
                aria-haspopup="listbox"
              >
                {meta.filtrarLabel}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-geo-muted transition",
                    filtroAbierto && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {filtroAbierto && (
                <ul
                  role="listbox"
                  className="absolute right-0 z-10 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {filtroOpciones.map((opcion) => (
                    <li
                      key={opcion.value}
                      role="option"
                      aria-selected={filtro === opcion.value}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFiltro(opcion.value);
                          setFiltroAbierto(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50",
                          filtro === opcion.value
                            ? "font-medium text-geo-pink"
                            : "text-geo-navy",
                        )}
                      >
                        {opcion.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <Button href={meta.explorarMapaHref} variant="primary" size="md">
            {meta.explorarMapaLabel}
          </Button>
        </div>
      </div>

      {filtro !== "todos" && (
        <p className="mt-4 text-xs text-geo-muted">
          Mostrando: <span className="font-medium text-geo-navy">{filtroActivo.label}</span>
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((espacio) => (
          <PerfilRecursoCard
            key={espacio.id}
            espacio={espacio}
            abrirLabel={meta.abrirLabel}
            onEliminar={onEliminarEspacio}
            eliminando={eliminandoId === espacio.id}
          />
        ))}
      </div>

      {filtrados.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-geo-muted">
          {espacios.length === 0
            ? "Aún no tienes espacios guardados. Explora el mapa y guarda tus favoritos."
            : "No hay espacios guardados de este tipo."}
        </p>
      )}
    </section>
  );
}
