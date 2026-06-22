"use client";

import { MoreVertical, Search, SquarePen, Trash2 } from "lucide-react";
import { AdminEditorSection } from "@/components/features/admin/AdminEditorSection";
import { AdminEspacioEstado } from "@/components/features/admin/AdminEspacioEstado";
import { AdminFlujoSection } from "@/components/features/admin/AdminFlujoSection";
import { MobileDataCard, MobileDataRow } from "@/components/shared/MobileDataCard";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminPageData } from "@/lib/services/admin.service";
import { adminMobileCardList } from "@/lib/theme/admin-table";
import { cn } from "@/lib/utils";

type AdminEspaciosSectionProps = {
  adminEspaciosTabs: AdminPageData["adminEspaciosTabs"];
  espaciosAdmin: AdminControllerState["espaciosAdmin"];
  listadoMeta: AdminControllerState["listadoMeta"];
  busqueda: AdminControllerState["busqueda"];
  setBusqueda: AdminControllerState["setBusqueda"];
  espaciosLoading: AdminControllerState["espaciosLoading"];
  irPaginaAnterior: AdminControllerState["irPaginaAnterior"];
  irPaginaSiguiente: AdminControllerState["irPaginaSiguiente"];
  dataSource: AdminPageData["dataSource"];
  tab: AdminControllerState["tab"];
  setTab: AdminControllerState["setTab"];
  onEdit: AdminControllerState["openEditModal"];
  onDelete: AdminControllerState["deleteEspacio"];
  flujoEspacios: AdminControllerState["flujoEspacios"];
  flujoLoading: AdminControllerState["flujoLoading"];
  flujoPublishingId: AdminControllerState["flujoPublishingId"];
  publishFlujoEspacio: AdminControllerState["publishFlujoEspacio"];
  editorEspacioId: AdminControllerState["editorEspacioId"];
  setEditorEspacioId: AdminControllerState["setEditorEspacioId"];
  editorLat: AdminControllerState["editorLat"];
  setEditorLat: AdminControllerState["setEditorLat"];
  editorLng: AdminControllerState["editorLng"];
  setEditorLng: AdminControllerState["setEditorLng"];
  editorSaving: AdminControllerState["editorSaving"];
  saveEditorCoords: AdminControllerState["saveEditorCoords"];
  actionError: AdminControllerState["actionError"];
};

export function AdminEspaciosSection({
  adminEspaciosTabs,
  espaciosAdmin,
  listadoMeta,
  busqueda,
  setBusqueda,
  espaciosLoading,
  irPaginaAnterior,
  irPaginaSiguiente,
  dataSource,
  tab,
  setTab,
  onEdit,
  onDelete,
  flujoEspacios,
  flujoLoading,
  flujoPublishingId,
  publishFlujoEspacio,
  editorEspacioId,
  setEditorEspacioId,
  editorLat,
  setEditorLat,
  editorLng,
  setEditorLng,
  editorSaving,
  saveEditorCoords,
  actionError,
}: AdminEspaciosSectionProps) {
  const filas =
    dataSource === "mock" && busqueda.trim()
      ? espaciosAdmin.filter((row) => {
          const q = busqueda.trim().toLowerCase();
          return (
            row.id.toLowerCase().includes(q) || row.nombre.toLowerCase().includes(q)
          );
        })
      : espaciosAdmin;

  return (
    <div className="mt-8">
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="w-full max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] sm:w-auto sm:overflow-visible"
          role="presentation"
        >
          <div
            className="inline-flex min-w-full rounded-lg border border-geo-border bg-geo-surface/80 p-1 sm:min-w-0 sm:w-fit"
            role="tablist"
            aria-label="Vistas de espacios culturales"
          >
            {adminEspaciosTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-label={t.label}
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-h-10 flex-1 whitespace-nowrap rounded-md px-2.5 py-2 text-center text-xs font-medium transition sm:min-h-0 sm:flex-initial sm:px-4 sm:text-sm",
                  tab === t.id
                    ? "bg-background text-geo-navy shadow-sm ring-1 ring-geo-border"
                    : "text-geo-muted hover:text-geo-navy",
                )}
              >
                <span className="sm:hidden">{t.shortLabel}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {tab === "listado" && (
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-geo-muted"
              aria-hidden
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={listadoMeta.busquedaPlaceholder}
              className="w-full rounded-lg border border-geo-border bg-geo-card py-2.5 pl-10 pr-4 text-sm text-geo-navy outline-none transition placeholder:text-geo-muted focus:border-geo-pink focus:ring-1 focus:ring-geo-pink/20"
            />
          </div>
        )}
      </div>

      {tab === "listado" && (
        <div className="mt-6 overflow-hidden rounded-xl border border-geo-border bg-geo-card shadow-sm">
          {espaciosLoading && (
            <p className="border-b border-geo-border px-5 py-2 text-xs text-geo-muted">
              Actualizando listado…
            </p>
          )}
          <div className={adminMobileCardList}>
            {filas.map((row) => (
              <MobileDataCard
                key={row.fullId}
                title={row.nombre}
                subtitle={row.id}
                badge={<AdminEspacioEstado estado={row.estado} />}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-geo-border px-3 text-sm font-medium text-geo-navy hover:bg-geo-surface"
                    >
                      <SquarePen className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm text-red-600 hover:bg-red-50"
                      aria-label={`Eliminar ${row.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                }
              >
                <MobileDataRow label="Alcaldía" value={row.alcaldia} />
                <MobileDataRow label="Tipo" value={row.tipo} />
                <MobileDataRow label="Modificado" value={row.ultimaModif} />
              </MobileDataCard>
            ))}
            {filas.length === 0 && !espaciosLoading && (
              <p className="px-4 py-12 text-center text-sm text-geo-muted">
                No se encontraron espacios con ese criterio.
              </p>
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-geo-border bg-geo-surface text-geo-muted">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    Nombre del Espacio
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    Alcaldía
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    Última Modif.
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filas.map((row) => (
                  <tr
                    key={row.fullId}
                    className="border-b border-geo-border last:border-0 hover:bg-geo-hover/60"
                  >
                    <td className="px-5 py-4 font-semibold text-geo-navy">{row.id}</td>
                    <td className="px-5 py-4 font-semibold text-foreground">{row.nombre}</td>
                    <td className="px-5 py-4 text-gray-700">{row.alcaldia}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-geo-border px-3 py-1 text-xs font-medium text-geo-navy">
                        {row.tipo}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <AdminEspacioEstado estado={row.estado} />
                    </td>
                    <td className="px-5 py-4 text-geo-muted">{row.ultimaModif}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="rounded-lg p-2 text-geo-muted transition hover:bg-geo-hover hover:text-geo-navy"
                          aria-label={`Editar ${row.nombre}`}
                        >
                          <SquarePen className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          aria-label={`Eliminar ${row.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditorEspacioId(row.fullId);
                            setTab("editor");
                          }}
                          className="rounded-lg p-2 text-geo-muted transition hover:bg-geo-hover hover:text-geo-navy"
                          aria-label={`Ubicación de ${row.nombre}`}
                        >
                          <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filas.length === 0 && !espaciosLoading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-geo-muted">
                      No se encontraron espacios con ese criterio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-geo-border px-5 py-4 text-sm text-geo-muted sm:flex-row">
            <p>
              Página {listadoMeta.pagina} de {listadoMeta.totalPaginas} ·{" "}
              {listadoMeta.totalEspacios.toLocaleString("es-MX")} espacios en total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!listadoMeta.puedeAnterior || espaciosLoading}
                onClick={irPaginaAnterior}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border border-geo-border bg-geo-card px-3 py-1.5 text-sm text-geo-muted transition",
                  !listadoMeta.puedeAnterior || espaciosLoading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-geo-surface",
                )}
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!listadoMeta.puedeSiguiente || espaciosLoading}
                onClick={irPaginaSiguiente}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border border-geo-border bg-geo-card px-3 py-1.5 text-sm font-medium text-geo-navy transition",
                  !listadoMeta.puedeSiguiente || espaciosLoading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-geo-surface",
                )}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "flujo" && (
        <AdminFlujoSection
          espacios={flujoEspacios}
          loading={flujoLoading}
          publishingId={flujoPublishingId}
          dataSource={dataSource}
          onEdit={onEdit}
          onPublish={publishFlujoEspacio}
          onOpenEditor={(row) => {
            setEditorEspacioId(row.fullId);
            setTab("editor");
          }}
        />
      )}

      {tab === "editor" && (
        <AdminEditorSection
          espacios={espaciosAdmin}
          selectedId={editorEspacioId}
          onSelectId={setEditorEspacioId}
          lat={editorLat}
          lng={editorLng}
          onLatChange={setEditorLat}
          onLngChange={setEditorLng}
          saving={editorSaving}
          onSave={saveEditorCoords}
          dataSource={dataSource}
        />
      )}
    </div>
  );
}
