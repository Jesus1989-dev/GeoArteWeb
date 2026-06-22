"use client";

import {
  BookOpen,
  ClipboardList,
  Database,
  FileBarChart,
  FileText,
  History,
  Layers,
  Mail,
  Map,
  Shield,
  Users,
} from "lucide-react";
import { AdminCuestionarioSection } from "@/components/features/admin/AdminCuestionarioSection";
import { AdminCapaFormModal } from "@/components/features/admin/AdminCapaFormModal";
import { AdminCapasSection } from "@/components/features/admin/AdminCapasSection";
import { AdminConsultaDetailModal } from "@/components/features/admin/AdminConsultaDetailModal";
import { AdminConsultasContactoSection } from "@/components/features/admin/AdminConsultasContactoSection";
import { AdminEspacioFormModal } from "@/components/features/admin/AdminEspacioFormModal";
import { AdminEspaciosSection } from "@/components/features/admin/AdminEspaciosSection";
import { AdminFuenteFormModal } from "@/components/features/admin/AdminFuenteFormModal";
import { AdminFuentesSection } from "@/components/features/admin/AdminFuentesSection";
import { AdminInvestigacionRecursoFormModal } from "@/components/features/admin/AdminInvestigacionRecursoFormModal";
import { AdminInvestigacionRecursosSection } from "@/components/features/admin/AdminInvestigacionRecursosSection";
import { AdminPoliticaRecomendacionFormModal } from "@/components/features/admin/AdminPoliticaRecomendacionFormModal";
import { AdminPoliticasRecomendacionesSection } from "@/components/features/admin/AdminPoliticasRecomendacionesSection";
import { AdminReportePlantillaFormModal } from "@/components/features/admin/AdminReportePlantillaFormModal";
import { AdminReportesSection } from "@/components/features/admin/AdminReportesSection";
import { AdminMapaCapasSection } from "@/components/features/admin/AdminMapaCapasSection";
import { AdminKpiCard } from "@/components/features/admin/AdminKpiCard";
import { AdminLogsSection } from "@/components/features/admin/AdminLogsSection";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AdminPendientesSection } from "@/components/features/admin/AdminPendientesSection";
import { AdminUsuarioCreateModal } from "@/components/features/admin/AdminUsuarioCreateModal";
import { AdminUsuarioRolModal } from "@/components/features/admin/AdminUsuarioRolModal";
import { AdminUsuariosSection } from "@/components/features/admin/AdminUsuariosSection";
import { AdminValidacionesSection } from "@/components/features/admin/AdminValidacionesSection";
import type { AdminPageData } from "@/lib/services/admin.service";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import { cn } from "@/lib/utils";

const menuIcons: Record<string, typeof Database> = {
  espacios: Database,
  capas: Layers,
  "mapa-capas": Map,
  fuentes: BookOpen,
  politicas: FileText,
  investigacion: ClipboardList,
  reportes: FileBarChart,
  cuestionario: ClipboardList,
  consultas: Mail,
  usuarios: Users,
  logs: History,
  pendientes: History,
};

type AdminViewProps = {
  data: AdminPageData;
} & AdminControllerState;

export function AdminView({
  data,
  adminKpis,
  seccion,
  setSeccion,
  tab,
  setTab,
  espaciosAdmin,
  listadoMeta,
  busqueda,
  setBusqueda,
  espaciosLoading,
  irPaginaAnterior,
  irPaginaSiguiente,
  formModal,
  formSaving,
  formError,
  categorias,
  actionError,
  openCreateModal,
  openEditModal,
  closeFormModal,
  submitFormModal,
  deleteEspacio,
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
  capas,
  capasLoading,
  capaFormModal,
  capaFormSaving,
  capaFormError,
  openCreateCapaModal,
  openEditCapaModal,
  closeCapaFormModal,
  submitCapaFormModal,
  deleteCapa,
  loadCapas,
  mapaCapasEstado,
  mapaCapasLoading,
  mapaCapasSyncing,
  mapaCapasSyncMessage,
  loadMapaCapasEstado,
  syncMapaCapasAdmin,
  usuarios,
  usuariosLoading,
  usuarioCreateModal,
  usuarioCreateSaving,
  usuarioCreateError,
  usuarioCreateSuccess,
  openCreateUsuarioModal,
  closeUsuarioCreateModal,
  submitUsuarioCreateModal,
  usuarioRolModal,
  usuarioRolSaving,
  usuarioRolError,
  openUsuarioRolModal,
  closeUsuarioRolModal,
  submitUsuarioRolModal,
  loadUsuarios,
  logs,
  logsLoading,
  irALogs,
  loadLogs,
  fuentes,
  fuentesLoading,
  fuenteFormModal,
  fuenteFormSaving,
  fuenteFormError,
  openCreateFuenteModal,
  openEditFuenteModal,
  closeFuenteFormModal,
  submitFuenteFormModal,
  deleteFuente,
  loadFuentes,
  consultas,
  consultasLoading,
  consultaDetailModal,
  consultaDetailSaving,
  consultaDetailError,
  openConsultaDetailModal,
  closeConsultaDetailModal,
  saveConsultaEstado,
  loadConsultas,
  contactoCentroConfig,
  contactoConfigSaving,
  contactoConfigError,
  saveContactoCentroConfig,
  politicasRecomendaciones,
  politicasLoading,
  politicaFormModal,
  politicaFormSaving,
  politicaFormError,
  openCreatePoliticaModal,
  openEditPoliticaModal,
  closePoliticaFormModal,
  submitPoliticaFormModal,
  togglePoliticaActivo,
  loadPoliticasRecomendaciones,
  politicasCentroConfig,
  politicasConfigSaving,
  politicasConfigError,
  savePoliticasCentroConfig,
  recursosCualitativos,
  recursosLoading,
  recursoFormModal,
  recursoFormSaving,
  recursoFormError,
  openCreateRecursoModal,
  openEditRecursoModal,
  closeRecursoFormModal,
  submitRecursoFormModal,
  toggleRecursoActivo,
  loadRecursosCualitativos,
  reportePlantillas,
  reportesLoading,
  reportesCentroConfig,
  reportesConfigSaving,
  reportesConfigError,
  reportePlantillaFormModal,
  reportePlantillaFormSaving,
  reportePlantillaFormError,
  openCreateReportePlantillaModal,
  openEditReportePlantillaModal,
  closeReportePlantillaFormModal,
  submitReportePlantillaFormModal,
  toggleReportePlantillaActivo,
  loadReportePlantillas,
  saveReportesCentroConfig,
}: AdminViewProps) {
  const {
    adminHeader,
    adminMenu,
    adminValidacionPendientes,
    adminEspaciosTabs,
    adminCapasSigMeta,
    adminMapaCapasMeta,
    validacionMetricas,
    dataSource,
    dataSourceNote,
  } = data;

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] bg-geo-surface">
      <AdminEspacioFormModal
        modal={formModal}
        categorias={categorias}
        saving={formSaving}
        error={formError}
        onClose={closeFormModal}
        onSubmit={submitFormModal}
      />
      <AdminFuenteFormModal
        modal={fuenteFormModal}
        saving={fuenteFormSaving}
        error={fuenteFormError}
        onClose={closeFuenteFormModal}
        onSubmit={submitFuenteFormModal}
      />
      <AdminConsultaDetailModal
        modal={consultaDetailModal}
        saving={consultaDetailSaving}
        error={consultaDetailError}
        onClose={closeConsultaDetailModal}
        onSaveEstado={saveConsultaEstado}
      />
      <AdminPoliticaRecomendacionFormModal
        modal={politicaFormModal}
        saving={politicaFormSaving}
        error={politicaFormError}
        onClose={closePoliticaFormModal}
        onSubmit={submitPoliticaFormModal}
      />
      <AdminInvestigacionRecursoFormModal
        modal={recursoFormModal}
        saving={recursoFormSaving}
        error={recursoFormError}
        onClose={closeRecursoFormModal}
        onSubmit={submitRecursoFormModal}
      />
      <AdminReportePlantillaFormModal
        modal={reportePlantillaFormModal}
        saving={reportePlantillaFormSaving}
        error={reportePlantillaFormError}
        onClose={closeReportePlantillaFormModal}
        onSubmit={submitReportePlantillaFormModal}
      />
      <AdminCapaFormModal
        modal={capaFormModal}
        saving={capaFormSaving}
        error={capaFormError}
        onClose={closeCapaFormModal}
        onSubmit={submitCapaFormModal}
      />
      <AdminUsuarioCreateModal
        modal={usuarioCreateModal}
        saving={usuarioCreateSaving}
        error={usuarioCreateError}
        successMessage={usuarioCreateSuccess}
        onClose={closeUsuarioCreateModal}
        onSubmit={submitUsuarioCreateModal}
      />
      <AdminUsuarioRolModal
        modal={usuarioRolModal}
        saving={usuarioRolSaving}
        error={usuarioRolError}
        onClose={closeUsuarioRolModal}
        onSubmit={submitUsuarioRolModal}
      />

      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-geo-border bg-geo-card lg:flex">
        <div className="border-b border-geo-border p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-geo-muted">
            Gestión de datos
          </p>
          <nav className="mt-2 space-y-1">
            {adminMenu
              .filter((m) => m.section === "Gestión de datos")
              .map((m) => {
                const Icon = menuIcons[m.id] ?? Database;
                const activo = seccion === m.id;
                const esCapasSig = m.id === "capas";

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSeccion(m.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                      esCapasSig
                        ? "text-geo-navy hover:bg-geo-surface"
                        : activo
                          ? "bg-geo-navy text-white"
                          : "text-geo-muted hover:bg-geo-surface hover:text-geo-navy",
                      esCapasSig && activo && "bg-geo-surface ring-1 ring-geo-border/80",
                    )}
                  >
                    {esCapasSig ? (
                      <Layers
                        size={16}
                        color="var(--geo-navy)"
                        strokeWidth={2}
                        className="shrink-0"
                        aria-hidden
                      />
                    ) : (
                      <Icon
                        size={16}
                        color={activo ? "#ffffff" : "var(--geo-muted)"}
                        strokeWidth={2}
                        className="shrink-0"
                        aria-hidden
                      />
                    )}
                    {m.label}
                    {"badge" in m && m.badge != null && m.badge > 0 && (
                      <span className="ml-auto rounded-full bg-geo-pink px-2 py-0.5 text-[10px] font-bold text-white">
                        {m.badge > 99 ? "99+" : m.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>
        <AdminValidacionesSection
          pendientes={adminValidacionPendientes}
          activo={seccion === adminValidacionPendientes.seccionId}
          onSelect={() => setSeccion(adminValidacionPendientes.seccionId)}
        />
        <div className="mt-auto p-4">
          <div className="flex gap-3 rounded-lg border border-geo-border bg-geo-surface/80 p-3">
            <Shield
              size={18}
              className="mt-0.5 shrink-0 text-geo-navy"
              strokeWidth={2}
              aria-hidden
            />
            <div className="min-w-0 text-xs">
              <p className="font-semibold text-geo-navy">Modo Administrador</p>
              <p className="mt-0.5 text-geo-muted">Acceso total concedido</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-geo-border bg-geo-card px-4 py-4 lg:hidden">
          <label className="text-xs font-medium text-geo-muted">Sección</label>
          <select
            value={seccion}
            onChange={(e) => setSeccion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm"
          >
            {adminMenu.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <AdminPageHeader
              header={adminHeader}
              onNuevoEspacio={() => {
                setSeccion("espacios");
                openCreateModal();
              }}
              onLogs={irALogs}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                  dataSource === "supabase"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900",
                )}
              >
                {dataSource === "supabase" ? "Métricas Supabase" : "Modo demo"}
              </span>
              {dataSourceNote && (
                <p className="text-xs text-geo-muted">{dataSourceNote}</p>
              )}
            </div>

            {actionError && !["espacios"].includes(seccion) && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                {actionError}
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {adminKpis.map((kpi) => (
                <AdminKpiCard key={kpi.label} kpi={kpi} />
              ))}
            </div>

            {seccion === "espacios" && (
              <AdminEspaciosSection
                adminEspaciosTabs={adminEspaciosTabs}
                espaciosAdmin={espaciosAdmin}
                listadoMeta={listadoMeta}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                espaciosLoading={espaciosLoading}
                irPaginaAnterior={irPaginaAnterior}
                irPaginaSiguiente={irPaginaSiguiente}
                dataSource={dataSource}
                tab={tab}
                setTab={setTab}
                onEdit={openEditModal}
                onDelete={deleteEspacio}
                flujoEspacios={flujoEspacios}
                flujoLoading={flujoLoading}
                flujoPublishingId={flujoPublishingId}
                publishFlujoEspacio={publishFlujoEspacio}
                editorEspacioId={editorEspacioId}
                setEditorEspacioId={setEditorEspacioId}
                editorLat={editorLat}
                setEditorLat={setEditorLat}
                editorLng={editorLng}
                setEditorLng={setEditorLng}
                editorSaving={editorSaving}
                saveEditorCoords={saveEditorCoords}
                actionError={actionError}
              />
            )}

            {seccion === "capas" && (
              <AdminCapasSection
                meta={adminCapasSigMeta}
                capas={capas}
                loading={capasLoading}
                dataSource={dataSource}
                onCreate={openCreateCapaModal}
                onEdit={openEditCapaModal}
                onDelete={deleteCapa}
                onRefresh={loadCapas}
              />
            )}

            {seccion === "mapa-capas" && (
              <AdminMapaCapasSection
                meta={adminMapaCapasMeta}
                estado={mapaCapasEstado}
                loading={mapaCapasLoading}
                syncing={mapaCapasSyncing}
                syncMessage={mapaCapasSyncMessage}
                dataSource={dataSource}
                onRefresh={loadMapaCapasEstado}
                onSync={syncMapaCapasAdmin}
              />
            )}

            {seccion === "fuentes" && (
              <AdminFuentesSection
                fuentes={fuentes}
                loading={fuentesLoading}
                dataSource={dataSource}
                onCreate={openCreateFuenteModal}
                onEdit={openEditFuenteModal}
                onDelete={deleteFuente}
                onRefresh={loadFuentes}
              />
            )}

            {seccion === "politicas" && (
              <AdminPoliticasRecomendacionesSection
                recomendaciones={politicasRecomendaciones}
                loading={politicasLoading}
                config={politicasCentroConfig}
                configSaving={politicasConfigSaving}
                configError={politicasConfigError}
                dataSource={dataSource}
                onCreate={openCreatePoliticaModal}
                onEdit={openEditPoliticaModal}
                onToggleActivo={togglePoliticaActivo}
                onRefresh={loadPoliticasRecomendaciones}
                onSaveConfig={savePoliticasCentroConfig}
              />
            )}

            {seccion === "investigacion" && (
              <AdminInvestigacionRecursosSection
                recursos={recursosCualitativos}
                loading={recursosLoading}
                dataSource={dataSource}
                onCreate={openCreateRecursoModal}
                onEdit={openEditRecursoModal}
                onToggleActivo={toggleRecursoActivo}
                onRefresh={loadRecursosCualitativos}
              />
            )}

            {seccion === "reportes" && (
              <AdminReportesSection
                plantillas={reportePlantillas}
                loading={reportesLoading}
                config={reportesCentroConfig}
                configSaving={reportesConfigSaving}
                configError={reportesConfigError}
                dataSource={dataSource}
                onCreate={openCreateReportePlantillaModal}
                onEdit={openEditReportePlantillaModal}
                onToggleActivo={toggleReportePlantillaActivo}
                onRefresh={loadReportePlantillas}
                onSaveConfig={saveReportesCentroConfig}
              />
            )}

            {seccion === "cuestionario" && <AdminCuestionarioSection />}

            {seccion === "consultas" && (
              <AdminConsultasContactoSection
                consultas={consultas}
                loading={consultasLoading}
                config={contactoCentroConfig}
                configSaving={contactoConfigSaving}
                configError={contactoConfigError}
                dataSource={dataSource}
                onRefresh={loadConsultas}
                onSaveConfig={saveContactoCentroConfig}
                onOpenDetail={openConsultaDetailModal}
              />
            )}

            {seccion === "pendientes" && (
              <AdminPendientesSection
                metricas={validacionMetricas}
                badge={adminValidacionPendientes.badge}
              />
            )}

            {seccion === "usuarios" && (
              <AdminUsuariosSection
                usuarios={usuarios}
                loading={usuariosLoading}
                dataSource={dataSource}
                onRefresh={loadUsuarios}
                onCreate={openCreateUsuarioModal}
                onEditRol={openUsuarioRolModal}
              />
            )}

            {seccion === "logs" && (
              <AdminLogsSection logs={logs} loading={logsLoading} onRefresh={loadLogs} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
