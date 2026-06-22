"use client";

import { useState } from "react";
import {
  PerfilConfigSection,
  resolvePerfilNameFields,
} from "@/components/features/perfil/PerfilConfigSection";
import { PerfilHeroHeader } from "@/components/features/perfil/PerfilHeroHeader";
import { PerfilHistorialSection } from "@/components/features/perfil/PerfilHistorialSection";
import { PerfilRecursosSection } from "@/components/features/perfil/PerfilRecursosSection";
import {
  PerfilTabs,
  type PerfilTabId,
} from "@/components/features/perfil/PerfilTabs";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import { badgeLabelForRol } from "@/lib/auth/display";
import type { PerfilStat } from "@/lib/domain/perfil";
import type { PerfilPageData } from "@/lib/services/perfil.service";
import { cn } from "@/lib/utils";

export type PerfilUsuarioDisplay = {
  nombre: string;
  subtitulo: string;
  badgeRol: string;
  avatarIniciales: string;
  avatarUrl?: string | null;
  rolActivoDefault: RolPerfil;
  stats: PerfilStat[];
  perfilActivoLabel: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type PerfilViewProps = {
  data: PerfilPageData;
  usuario: PerfilUsuarioDisplay;
  rolInicial: RolPerfil;
  onEliminarEspacio?: (espacioId: string) => void;
  eliminandoId?: string | null;
  onReloadHistorial?: () => Promise<unknown>;
  onSaveName?: (input: { firstName: string; lastName: string }) => Promise<string | null>;
  canUploadAvatar?: boolean;
  onUploadAvatar?: (file: File) => Promise<string | null>;
};

export function PerfilView({
  data,
  usuario,
  rolInicial,
  onEliminarEspacio,
  eliminandoId,
  onReloadHistorial,
  onSaveName,
  canUploadAvatar = false,
  onUploadAvatar,
}: PerfilViewProps) {
  const {
    perfilTabs,
    perfilRecursosMeta,
    espaciosGuardados,
    historialExportaciones,
    dataSource,
    dataSourceNote,
    canEditConfig,
    canEliminar,
  } = data;

  const [tab, setTab] = useState<PerfilTabId>("recursos");

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-geo-surface pb-12">
      <PerfilHeroHeader
        usuario={usuario}
        rolActivo={rolInicial}
        rolLabel={badgeLabelForRol(rolInicial)}
        canUploadAvatar={canUploadAvatar}
        onUploadAvatar={onUploadAvatar}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              dataSource === "supabase"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900",
            )}
          >
            {dataSource === "supabase" ? "Perfil Supabase" : "Modo demo"}
          </span>
          {dataSourceNote && (
            <p className="text-xs text-foreground/70">{dataSourceNote}</p>
          )}
        </div>

        <PerfilTabs tabs={perfilTabs} active={tab} onChange={setTab} />

        <div className="mt-8">
          {tab === "recursos" && (
            <PerfilRecursosSection
              espacios={espaciosGuardados}
              meta={perfilRecursosMeta}
              onEliminarEspacio={onEliminarEspacio}
              eliminandoId={eliminandoId}
            />
          )}

          {tab === "historial" && (
            <PerfilHistorialSection
              exportaciones={historialExportaciones}
              dataSource={dataSource}
              canManage={canEliminar && onReloadHistorial != null}
              onReload={onReloadHistorial}
            />
          )}

          {tab === "config" && (
            <PerfilConfigSection
              {...resolvePerfilNameFields(usuario)}
              canEdit={canEditConfig && onSaveName != null}
              onSave={onSaveName ?? (async () => "No disponible en modo demo.")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
