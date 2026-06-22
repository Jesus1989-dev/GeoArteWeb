"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { CuestionarioAdminRow, CuestionarioEstatusRevision } from "@/lib/domain/cuestionario";
import { periodoSemestralActual, etiquetaPeriodoSemestral } from "@/lib/cuestionario/cuestionario-periodo";
import { cn } from "@/lib/utils";

const ESTATUS_STYLES: Record<CuestionarioEstatusRevision, string> = {
  pendiente: "bg-amber-100 text-amber-900",
  revisado: "bg-emerald-100 text-emerald-800",
  observado: "bg-red-100 text-red-800",
};

async function fetchAdminRows(periodo: string): Promise<CuestionarioAdminRow[]> {
  const res = await fetch(
    `/api/admin/cuestionario?periodo=${encodeURIComponent(periodo)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as { rows?: CuestionarioAdminRow[]; error?: string };
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
  return body.rows ?? [];
}

async function patchRevision(
  id: string,
  periodo: string,
  estatus: CuestionarioEstatusRevision,
  notas?: string,
): Promise<CuestionarioAdminRow> {
  const res = await fetch(`/api/admin/cuestionario/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ periodo, estatus, notas: notas ?? null }),
  });
  const body = (await res.json()) as { row?: CuestionarioAdminRow; error?: string };
  if (!res.ok || !body.row) throw new Error(body.error ?? `Error ${res.status}`);
  return body.row;
}

export function AdminCuestionarioSection() {
  const [periodo, setPeriodo] = useState(periodoSemestralActual());
  const [rows, setRows] = useState<CuestionarioAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notasDraft, setNotasDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchAdminRows(periodo);
      setRows(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRevision = async (
    row: CuestionarioAdminRow,
    estatus: CuestionarioEstatusRevision,
  ) => {
    setSavingId(row.id);
    setError(null);
    try {
      const updated = await patchRevision(
        row.id,
        periodo,
        estatus,
        notasDraft[row.id] ?? row.notasRevision ?? undefined,
      );
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSavingId(null);
    }
  };

  const pendientes = rows.filter((r) => r.estatusRevision === "pendiente").length;

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-geo-navy">Cuestionario SECTEI</h2>
          <p className="text-sm text-geo-muted">
            Revisión de respuestas capturadas en app móvil · {etiquetaPeriodoSemestral(periodo)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-lg border border-geo-border px-3 py-2 text-sm"
          >
            <option value={periodo}>{periodo}</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded-lg border border-geo-border px-3 py-2 text-sm text-geo-navy hover:bg-geo-surface"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <Link
            href="/cuestionario"
            className="rounded-lg bg-geo-pink px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Ver panel público
          </Link>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-geo-border bg-geo-card p-4">
          <p className="text-xs text-geo-muted">Total respuestas</p>
          <p className="text-2xl font-bold text-geo-navy">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-geo-border bg-geo-card p-4">
          <p className="text-xs text-geo-muted">Pendientes de revisión</p>
          <p className="text-2xl font-bold text-amber-700">{pendientes}</p>
        </div>
        <div className="rounded-xl border border-geo-border bg-geo-card p-4">
          <p className="text-xs text-geo-muted">Revisadas</p>
          <p className="text-2xl font-bold text-emerald-700">
            {rows.filter((r) => r.estatusRevision === "revisado").length}
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-geo-border bg-geo-card shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-geo-border bg-geo-surface text-xs uppercase text-geo-muted">
            <tr>
              <th className="px-4 py-3">Espacio</th>
              <th className="px-4 py-3">Alcaldía</th>
              <th className="px-4 py-3">Usuarios</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3">Notas</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-geo-muted">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-geo-muted">
                  Sin respuestas para este periodo.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-geo-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-geo-navy">{row.espacioNombre}</td>
                  <td className="px-4 py-3">{row.espacioAlcaldia}</td>
                  <td className="px-4 py-3">{row.usuarios ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        ESTATUS_STYLES[row.estatusRevision],
                      )}
                    >
                      {row.estatusRevision}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={notasDraft[row.id] ?? row.notasRevision ?? ""}
                      onChange={(e) =>
                        setNotasDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      placeholder="Observaciones…"
                      className="w-full min-w-[140px] rounded border border-geo-border px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["revisado", "observado", "pendiente"] as const).map((est) => (
                        <button
                          key={est}
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() => void onRevision(row, est)}
                          className="rounded border border-geo-border px-2 py-1 text-xs capitalize hover:bg-geo-surface disabled:opacity-50"
                        >
                          {est}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
