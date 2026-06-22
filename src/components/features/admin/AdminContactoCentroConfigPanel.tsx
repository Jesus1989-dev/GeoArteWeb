"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { AdminControllerState } from "@/hooks/use-admin-controller";
import type { AdminContactoCentroConfigFormInput } from "@/lib/domain/admin";

type AdminContactoCentroConfigPanelProps = {
  config: AdminContactoCentroConfigFormInput;
  saving: boolean;
  error: string | null;
  dataSource: "supabase" | "mock";
  onSave: AdminControllerState["saveContactoCentroConfig"];
};

const inputClass =
  "mt-1 w-full rounded-lg border border-geo-border px-3 py-2 text-sm outline-none focus:border-geo-pink disabled:bg-geo-surface";
const labelClass = "text-xs font-semibold text-geo-navy";

export function AdminContactoCentroConfigPanel({
  config,
  saving,
  error,
  dataSource,
  onSave,
}: AdminContactoCentroConfigPanelProps) {
  const [form, setForm] = useState<AdminContactoCentroConfigFormInput>(config);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const disabled = dataSource !== "supabase" || saving;

  function patch(partial: Partial<AdminContactoCentroConfigFormInput>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="mt-10 rounded-xl border border-geo-border bg-geo-card p-5 shadow-sm">
      <h3 className="font-semibold text-geo-navy">Contenido editorial de `/contacto`</h3>
      <p className="mt-0.5 text-sm text-geo-muted">
        Hero, buzón, FAQ, API, datasets y bloque de políticas (`contacto_centro_config`). El
        reporte anual usa el año de corte automáticamente.
      </p>

      {dataSource !== "supabase" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Conecta Supabase y aplica la migración `contacto_centro_config` para editar este
          contenido.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form
        className="mt-4 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-geo-navy">Hero</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ct-hero-bc-inicio" className={labelClass}>
                Breadcrumb inicio
              </label>
              <input
                id="ct-hero-bc-inicio"
                value={form.heroBreadcrumbInicio}
                onChange={(e) => patch({ heroBreadcrumbInicio: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ct-hero-bc-actual" className={labelClass}>
                Breadcrumb actual
              </label>
              <input
                id="ct-hero-bc-actual"
                value={form.heroBreadcrumbActual}
                onChange={(e) => patch({ heroBreadcrumbActual: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ct-hero-titulo" className={labelClass}>
              Título *
            </label>
            <input
              id="ct-hero-titulo"
              required
              value={form.heroTitulo}
              onChange={(e) => patch({ heroTitulo: e.target.value })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ct-hero-sub" className={labelClass}>
              Subtítulo *
            </label>
            <textarea
              id="ct-hero-sub"
              required
              rows={2}
              value={form.heroSubtitulo}
              onChange={(e) => patch({ heroSubtitulo: e.target.value })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-geo-navy">Buzón y formulario</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ct-buzon-badge" className={labelClass}>
                Badge
              </label>
              <input
                id="ct-buzon-badge"
                value={form.buzonBadge}
                onChange={(e) => patch({ buzonBadge: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ct-buzon-btn" className={labelClass}>
                Texto botón enviar
              </label>
              <input
                id="ct-buzon-btn"
                value={form.buzonBtnEnviar}
                onChange={(e) => patch({ buzonBtnEnviar: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ct-buzon-titulo" className={labelClass}>
              Título del buzón *
            </label>
            <input
              id="ct-buzon-titulo"
              required
              value={form.buzonTitulo}
              onChange={(e) => patch({ buzonTitulo: e.target.value })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ct-buzon-desc" className={labelClass}>
              Descripción
            </label>
            <textarea
              id="ct-buzon-desc"
              rows={2}
              value={form.buzonDescripcion}
              onChange={(e) => patch({ buzonDescripcion: e.target.value })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["nombre", "buzonNombreLabel", "buzonNombrePlaceholder"],
                ["email", "buzonEmailLabel", "buzonEmailPlaceholder"],
                ["asunto", "buzonAsuntoLabel", "buzonAsuntoPlaceholder"],
                ["mensaje", "buzonMensajeLabel", "buzonMensajePlaceholder"],
              ] as const
            ).map(([field, labelKey, placeholderKey]) => (
              <div key={field} className="space-y-2 rounded-lg border border-geo-border p-3">
                <p className="text-xs font-medium uppercase text-geo-muted">{field}</p>
                <input
                  aria-label={`${field} label`}
                  value={form[labelKey]}
                  onChange={(e) => patch({ [labelKey]: e.target.value })}
                  disabled={disabled}
                  className={inputClass}
                  placeholder="Etiqueta"
                />
                <input
                  aria-label={`${field} placeholder`}
                  value={form[placeholderKey]}
                  onChange={(e) => patch({ [placeholderKey]: e.target.value })}
                  disabled={disabled}
                  className={inputClass}
                  placeholder="Placeholder"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-geo-navy">FAQ</h4>
          <div>
            <label htmlFor="ct-faq-titulo" className={labelClass}>
              Título de la sección
            </label>
            <input
              id="ct-faq-titulo"
              value={form.faqTitulo}
              onChange={(e) => patch({ faqTitulo: e.target.value })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ct-faq-json" className={labelClass}>
              Preguntas (JSON)
            </label>
            <textarea
              id="ct-faq-json"
              rows={8}
              value={form.faqItemsJson}
              onChange={(e) => patch({ faqItemsJson: e.target.value })}
              disabled={disabled}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-geo-navy">API pública</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ct-api-titulo" className={labelClass}>
                Título
              </label>
              <input
                id="ct-api-titulo"
                value={form.apiTitulo}
                onChange={(e) => patch({ apiTitulo: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ct-api-doc-btn" className={labelClass}>
                Botón documentación
              </label>
              <input
                id="ct-api-doc-btn"
                value={form.apiBtnDocumentacion}
                onChange={(e) => patch({ apiBtnDocumentacion: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ct-api-sub" className={labelClass}>
              Subtítulo
            </label>
            <textarea
              id="ct-api-sub"
              rows={2}
              value={form.apiSubtitulo}
              onChange={(e) => patch({ apiSubtitulo: e.target.value })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ct-api-curl" className={labelClass}>
                Título bloque cURL
              </label>
              <input
                id="ct-api-curl"
                value={form.apiCurlTitulo}
                onChange={(e) => patch({ apiCurlTitulo: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ct-api-copy" className={labelClass}>
                Botón copiar token
              </label>
              <input
                id="ct-api-copy"
                value={form.apiBtnCopiarToken}
                onChange={(e) => patch({ apiBtnCopiarToken: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ct-api-token" className={labelClass}>
                Etiqueta token demo
              </label>
              <input
                id="ct-api-token"
                value={form.apiDemoToken}
                onChange={(e) => patch({ apiDemoToken: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ct-api-endpoints" className={labelClass}>
              Endpoints (JSON)
            </label>
            <textarea
              id="ct-api-endpoints"
              rows={6}
              value={form.apiEndpointsJson}
              onChange={(e) => patch({ apiEndpointsJson: e.target.value })}
              disabled={disabled}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-geo-navy">Datasets descargables</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ct-ds-titulo" className={labelClass}>
                Título de sección
              </label>
              <input
                id="ct-ds-titulo"
                value={form.datasetsTitulo}
                onChange={(e) => patch({ datasetsTitulo: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ct-ds-btn" className={labelClass}>
                Texto botón descargar
              </label>
              <input
                id="ct-ds-btn"
                value={form.datasetsBtnDescargar}
                onChange={(e) => patch({ datasetsBtnDescargar: e.target.value })}
                disabled={disabled}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ct-ds-json" className={labelClass}>
              Tarjetas (JSON)
            </label>
            <textarea
              id="ct-ds-json"
              rows={8}
              value={form.datasetsJson}
              onChange={(e) => patch({ datasetsJson: e.target.value })}
              disabled={disabled}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-geo-navy">Políticas y enlaces</h4>
          <div>
            <label htmlFor="ct-pol-json" className={labelClass}>
              Bloques (JSON)
            </label>
            <textarea
              id="ct-pol-json"
              rows={10}
              value={form.politicasJson}
              onChange={(e) => patch({ politicasJson: e.target.value })}
              disabled={disabled}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </section>

        <div className="flex justify-end border-t border-geo-border pt-4">
          <Button type="submit" disabled={disabled}>
            {saving ? "Guardando…" : "Guardar contenido editorial"}
          </Button>
        </div>
      </form>
    </div>
  );
}
