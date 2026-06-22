"use client";

import { Microscope, ShieldCheck, User, type LucideIcon } from "lucide-react";
import type { AuthPageData } from "@/lib/services/auth.service";
import type { perfilRoles, RolPerfil } from "@/lib/data/mock/perfil";
import { cn } from "@/lib/utils";

const roleIcons: Record<(typeof perfilRoles)[number]["icon"], LucideIcon> = {
  user: User,
  microscope: Microscope,
  shield: ShieldCheck,
};

type AuthRolePickerProps = {
  roles: AuthPageData["roles"];
  descriptions: AuthPageData["roleDescriptions"];
  value: RolPerfil;
  onChange: (rol: RolPerfil) => void;
  label: string;
};

export function AuthRolePicker({
  roles,
  descriptions,
  value,
  onChange,
  label,
}: AuthRolePickerProps) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold uppercase tracking-wide text-geo-navy">
        {label}
      </legend>
      <div className="mt-2 space-y-2">
        {roles.map((r) => {
          const Icon = roleIcons[r.icon];
          const active = value === r.id;
          const desc = descriptions[r.id];

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                active
                  ? "border-geo-navy bg-geo-navy/5 ring-1 ring-geo-navy/20 dark:bg-geo-navy/25 dark:ring-geo-navy/40"
                  : "border-geo-border bg-geo-card hover:border-geo-border hover:bg-geo-hover/60",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  active ? "bg-geo-navy text-white" : "bg-geo-surface text-geo-navy",
                )}
              >
                <Icon size={18} strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-geo-navy">
                  {desc.titulo}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-geo-muted">
                  {desc.descripcion}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
