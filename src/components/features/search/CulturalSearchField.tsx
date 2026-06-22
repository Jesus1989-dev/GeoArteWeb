"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, MapPin, Search } from "lucide-react";
import { listAlcaldiasForPicker } from "@/lib/data/supabase/search.repository";
import type { EspacioSearchSuggestion } from "@/lib/domain/search";
import { filterAlcaldias } from "@/lib/mapa/filter-espacios";
import { alcaldiasCoincidentes, mapaSearchUrl, resolveAlcaldiaFromQuery } from "@/lib/mapa/search-utils";
import { cn } from "@/lib/utils";

type CulturalSearchFieldProps = {
  variant?: "hero" | "compact" | "map";
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit?: () => void;
  alcaldias?: string[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showExploreButton?: boolean;
  exploreLabel?: string;
  autoNavigate?: boolean;
  onNavigate?: (input: { q: string; alcaldia?: string; espacioId?: string }) => void;
};

export function CulturalSearchField({
  variant = "compact",
  query,
  onQueryChange,
  onSubmit,
  alcaldias = [],
  placeholder = "Buscar alcaldía o espacio cultural…",
  className,
  inputClassName,
  showExploreButton = false,
  exploreLabel = "Explorar Datos",
  autoNavigate = true,
  onNavigate,
}: CulturalSearchFieldProps) {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState<EspacioSearchSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showAlcaldiaPicker, setShowAlcaldiaPicker] = useState(false);

  const trimmedQuery = query.trim();
  const isEmptyQuery = trimmedQuery.length === 0;
  const isHero = variant === "hero";
  const isMap = variant === "map";

  const alcaldiaSuggestions = useMemo(() => {
    if (isEmptyQuery) return listAlcaldiasForPicker(alcaldias);
    const limit = isMap || isHero ? 16 : 5;
    return filterAlcaldias(alcaldias, query, limit).map((nombre) => ({
      id: `alcaldia-${nombre}`,
      label: nombre,
      subtitle: "Alcaldía · CDMX",
      kind: "alcaldia" as const,
    }));
  }, [alcaldias, isEmptyQuery, isHero, isMap, query]);

  const espacioSuggestions = useMemo(
    () => remoteSuggestions.filter((item) => item.kind === "espacio"),
    [remoteSuggestions],
  );

  const visibleAlcaldias = useMemo(() => {
    if (!showAlcaldiaPicker && !isEmptyQuery) return alcaldiaSuggestions;
    if (isEmptyQuery) return listAlcaldiasForPicker(alcaldias);
    return alcaldiaSuggestions.length > 0
      ? alcaldiaSuggestions
      : alcaldiasCoincidentes(alcaldias, query, 16).map((nombre) => ({
          id: `alcaldia-${nombre}`,
          label: nombre,
          subtitle: "Alcaldía · CDMX",
          kind: "alcaldia" as const,
        }));
  }, [alcaldiaSuggestions, alcaldias, isEmptyQuery, query, showAlcaldiaPicker]);

  const flatSuggestions = useMemo(() => {
    if (isEmptyQuery || showAlcaldiaPicker) return visibleAlcaldias;
    return [...alcaldiaSuggestions, ...espacioSuggestions];
  }, [
    alcaldiaSuggestions,
    espacioSuggestions,
    isEmptyQuery,
    showAlcaldiaPicker,
    visibleAlcaldias,
  ]);

  const panelOpen = open;

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setRemoteSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/espacios?q=${encodeURIComponent(trimmedQuery)}`, {
          cache: "no-store",
        });
        const body = (await res.json()) as { suggestions?: EspacioSearchSuggestion[] };
        if (!cancelled) {
          setRemoteSuggestions(body.suggestions ?? []);
        }
      } catch {
        if (!cancelled) setRemoteSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShowAlcaldiaPicker(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function navigateToMap(input: { q: string; alcaldia?: string; espacioId?: string }) {
    if (onNavigate) {
      onNavigate(input);
      return;
    }
    if (!autoNavigate) return;
    router.push(mapaSearchUrl(input));
  }

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const q = trimmedQuery;
    if (!q) {
      if (autoNavigate) router.push("/mapa");
      onSubmit?.();
      return;
    }

    const alcaldia = resolveAlcaldiaFromQuery(q, alcaldias) ?? undefined;
    navigateToMap({ q, alcaldia });
    onSubmit?.();
    setOpen(false);
    setShowAlcaldiaPicker(false);
  }

  function selectSuggestion(suggestion: EspacioSearchSuggestion) {
    if (suggestion.kind === "alcaldia") {
      onQueryChange(suggestion.label);
      navigateToMap({ q: suggestion.label, alcaldia: suggestion.label });
    } else {
      onQueryChange(suggestion.label);
      navigateToMap({ q: suggestion.label, espacioId: suggestion.espacioId });
    }
    setOpen(false);
    setShowAlcaldiaPicker(false);
    onSubmit?.();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flatSuggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && flatSuggestions[activeIndex]) {
      event.preventDefault();
      selectSuggestion(flatSuggestions[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setShowAlcaldiaPicker(false);
      setActiveIndex(-1);
    }
  }

  const showAlcaldiaToggle = isHero || isMap;
  const showFullAlcaldiaList = isEmptyQuery || showAlcaldiaPicker;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        showExploreButton ? "flex flex-col gap-3 sm:flex-row" : "relative",
        className,
      )}
    >
      <div
        ref={rootRef}
        className={cn("relative min-w-0", showExploreButton ? "flex-1" : "w-full")}
      >
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-geo-muted",
            isHero ? "left-4 h-4 w-4" : "left-3 h-4 w-4",
          )}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
            setShowAlcaldiaPicker(false);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setOpen(true);
            if (isEmptyQuery) setShowAlcaldiaPicker(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={panelOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={cn(
            "w-full border border-geo-border bg-white text-sm text-geo-navy outline-none focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/20",
            isHero && "h-12 rounded-full pl-11 pr-10 shadow-sm",
            isMap && "rounded-lg py-2.5 pl-9 pr-10",
            !isHero && !isMap && "h-10 rounded-full bg-gray-100 pl-9 pr-3 focus:bg-white",
            inputClassName,
          )}
        />
        {showAlcaldiaToggle && (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setShowAlcaldiaPicker((value) => !value);
              setActiveIndex(-1);
            }}
            className={cn(
              "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md text-geo-muted transition-colors hover:bg-geo-surface hover:text-geo-navy",
              isHero ? "right-3 h-8 w-8 rounded-full" : "right-2 h-8 w-8",
            )}
            aria-label={showAlcaldiaPicker ? "Ocultar alcaldías" : "Ver alcaldías de la CDMX"}
            aria-expanded={showAlcaldiaPicker}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showAlcaldiaPicker && "rotate-180")}
              aria-hidden
            />
          </button>
        )}

        {panelOpen && (
          <div
            id={listboxId}
            role="listbox"
            className={cn(
              "absolute z-[1000] mt-2 overflow-hidden rounded-xl border border-geo-border bg-white shadow-xl",
              isHero && "left-0 right-0",
              isMap && "left-0 w-[min(100vw-2rem,380px)] max-w-[380px] sm:w-[380px]",
              !isHero && !isMap && "left-0 right-0 min-w-[280px]",
            )}
          >
            {showFullAlcaldiaList ? (
              <div className="max-h-[min(60vh,360px)] overflow-y-auto overscroll-contain">
                <p className="sticky top-0 z-10 border-b border-geo-border bg-geo-surface/95 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-geo-muted backdrop-blur-sm">
                  Alcaldías de la CDMX ({visibleAlcaldias.length})
                </p>
                <ul className={cn(isMap ? "grid grid-cols-1 sm:grid-cols-2" : "divide-y divide-geo-border/60")}>
                  {visibleAlcaldias.map((suggestion, index) => (
                    <li key={suggestion.id}>
                      <SuggestionRow
                        suggestion={suggestion}
                        active={index === activeIndex}
                        compact={isMap}
                        hideSubtitle={showFullAlcaldiaList}
                        onSelect={selectSuggestion}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                {loading && alcaldiaSuggestions.length === 0 && espacioSuggestions.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-geo-muted">Buscando en el padrón…</p>
                ) : (
                  <>
                    {alcaldiaSuggestions.length > 0 && (
                      <div>
                        <p className="border-b border-geo-border bg-geo-surface px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                          Alcaldías
                        </p>
                        {alcaldiaSuggestions.map((suggestion, index) => (
                          <SuggestionRow
                            key={suggestion.id}
                            suggestion={suggestion}
                            active={index === activeIndex}
                            onSelect={selectSuggestion}
                          />
                        ))}
                      </div>
                    )}

                    {espacioSuggestions.length > 0 && (
                      <div>
                        <p className="border-b border-geo-border bg-geo-surface px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-geo-muted">
                          Espacios culturales
                        </p>
                        {espacioSuggestions.map((suggestion, index) => {
                          const flatIndex = alcaldiaSuggestions.length + index;
                          return (
                            <SuggestionRow
                              key={suggestion.id}
                              suggestion={suggestion}
                              active={flatIndex === activeIndex}
                              onSelect={selectSuggestion}
                            />
                          );
                        })}
                      </div>
                    )}

                    {!loading &&
                      alcaldiaSuggestions.length === 0 &&
                      espacioSuggestions.length === 0 && (
                        <p className="px-4 py-3 text-sm text-geo-muted">
                          Sin coincidencias. Presiona Enter para buscar «{trimmedQuery}» en el mapa.
                        </p>
                      )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showExploreButton && (
        <button
          type="submit"
          className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-geo-pink px-7 text-base font-medium text-white shadow-sm transition-colors hover:bg-geo-pink-hover sm:w-auto"
        >
          {exploreLabel}
        </button>
      )}
    </form>
  );
}

function SuggestionRow({
  suggestion,
  active,
  compact = false,
  hideSubtitle = false,
  onSelect,
}: {
  suggestion: EspacioSearchSuggestion;
  active: boolean;
  compact?: boolean;
  hideSubtitle?: boolean;
  onSelect: (suggestion: EspacioSearchSuggestion) => void;
}) {
  const showSubtitle =
    !hideSubtitle && suggestion.subtitle && suggestion.kind !== "alcaldia";

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(suggestion)}
      className={cn(
        "flex w-full items-start gap-2.5 text-left transition-colors hover:bg-geo-surface",
        compact ? "px-3 py-2.5" : "gap-3 px-4 py-3",
        active && "bg-geo-surface",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-geo-surface text-geo-navy",
          compact ? "mt-0.5 h-7 w-7" : "mt-0.5 h-8 w-8",
        )}
      >
        {suggestion.kind === "alcaldia" ? (
          <MapPin className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={2} />
        ) : (
          <Building2 className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={2} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-medium text-geo-navy",
            compact ? "text-xs leading-snug" : "text-sm leading-snug",
            suggestion.kind === "alcaldia" ? "whitespace-normal" : "truncate",
          )}
        >
          {suggestion.label}
        </span>
        {showSubtitle && (
          <span className="mt-0.5 block truncate text-xs text-geo-muted">
            {suggestion.subtitle}
          </span>
        )}
      </span>
    </button>
  );
}
