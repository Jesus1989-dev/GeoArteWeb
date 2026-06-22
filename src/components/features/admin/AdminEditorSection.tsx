"use client";

import Link from "next/link";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { AdminEspacioRow } from "@/lib/domain/admin";

type AdminEditorSectionProps = {
  espacios: AdminEspacioRow[];
  selectedId: string;
  onSelectId: (id: string) => void;
  lat: string;
  lng: string;
  onLatChange: (v: string) => void;
  onLngChange: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  dataSource: "supabase" | "mock";
};

export function AdminEditorSection({
  espacios,
  selectedId,
  onSelectId,
  lat,
  lng,
  onLatChange,
  onLngChange,
  saving,
  onSave,
  dataSource,
}: AdminEditorSectionProps) {
  const selected = espacios.find((e) => e.fullId === selectedId);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-bold text-geo-navy">
          <MapPin className="h-4 w-4 text-geo-pink" aria-hidden />
          Editor cartográfico
        </h3>
        <p className="mt-1 text-xs text-geo-muted">
          Ajusta las coordenadas WGS84 del espacio. Para publicar en mapa se requieren latitud y
          longitud válidas.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="editor-espacio" className="text-xs font-semibold text-geo-navy">
              Espacio
            </label>
            <select
              id="editor-espacio"
              value={selectedId}
              onChange={(e) => onSelectId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-geo-border bg-geo-card px-3 py-2 text-sm outline-none focus:border-geo-pink"
            >
              <option value="">Selecciona un espacio…</option>
              {espacios.map((e) => (
                <option key={e.fullId} value={e.fullId}>
                  {e.nombre} ({e.id})
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <p className="rounded-lg bg-geo-surface px-3 py-2 text-xs text-geo-muted">
              {selected.alcaldia} · {selected.tipo} · estado{" "}
              <strong className="text-geo-navy">{selected.estado}</strong>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="editor-lat" className="text-xs font-semibold text-geo-navy">
                Latitud
              </label>
              <input
                id="editor-lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => onLatChange(e.target.value)}
                disabled={!selectedId}
                placeholder="19.4326"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="editor-lng" className="text-xs font-semibold text-geo-navy">
                Longitud
              </label>
              <input
                id="editor-lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => onLngChange(e.target.value)}
                disabled={!selectedId}
                placeholder="-99.1332"
                className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!selectedId || saving}
              onClick={onSave}
              className="gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Guardar coordenadas
            </Button>
            {selectedId && lat && lng && (
              <Link
                href={`/mapa?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`}
                className="inline-flex items-center rounded-lg border border-geo-border px-4 py-2 text-sm font-medium text-geo-navy hover:bg-geo-surface"
              >
                Ver en mapa
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-geo-border bg-geo-surface/50 p-5">
        <p className="text-sm font-semibold text-geo-navy">Vista previa</p>
        <p className="mt-2 text-xs leading-relaxed text-geo-muted">
          {selected
            ? `Punto en (${lat || "—"}, ${lng || "—"}). ${
                dataSource === "supabase"
                  ? "Los cambios se guardan en espacios_culturales vía API administrativa."
                  : "Modo demo — cambios solo en memoria."
              }`
            : "Selecciona un espacio del listado maestro para editar su ubicación."}
        </p>
        {lat && lng && (
          <div className="mt-4 overflow-hidden rounded-lg border border-geo-border bg-geo-card">
            <iframe
              title="Vista previa OpenStreetMap"
              className="h-64 w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number.parseFloat(lng) - 0.01}%2C${Number.parseFloat(lat) - 0.01}%2C${Number.parseFloat(lng) + 0.01}%2C${Number.parseFloat(lat) + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
