"use client";

import { useEffect, useState } from "react";
import { splitFullName } from "@/lib/auth/profile-name";
import { cn } from "@/lib/utils";

type PerfilConfigSectionProps = {
  firstName: string;
  lastName: string;
  canEdit: boolean;
  onSave: (input: { firstName: string; lastName: string }) => Promise<string | null>;
};

export function PerfilConfigSection({
  firstName,
  lastName,
  canEdit,
  onSave,
}: PerfilConfigSectionProps) {
  const [nombre, setNombre] = useState(firstName);
  const [apellidos, setApellidos] = useState(lastName);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNombre(firstName);
    setApellidos(lastName);
  }, [firstName, lastName]);

  const puedeGuardar = canEdit && nombre.trim().length >= 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeGuardar) return;

    setGuardando(true);
    setMensaje(null);
    setError(null);

    const result = await onSave({
      firstName: nombre.trim(),
      lastName: apellidos.trim(),
    });

    if (result != null) {
      setError(result);
    } else {
      setMensaje("Datos de perfil actualizados correctamente.");
    }
    setGuardando(false);
  }

  return (
    <section aria-labelledby="perfil-config-titulo">
      <div>
        <h2
          id="perfil-config-titulo"
          className="text-xl font-bold text-geo-navy sm:text-2xl"
        >
          Configuración de cuenta
        </h2>
        <p className="mt-1 max-w-xl text-sm text-geo-muted">
          {canEdit
            ? "Actualiza cómo aparece tu nombre en la plataforma. La foto de perfil se cambia desde la cabecera de esta página."
            : "Inicia sesión con Supabase para editar tu perfil."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg rounded-xl border border-geo-border bg-geo-card p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="perfil-nombre" className="text-sm font-medium text-geo-navy">
              Nombre
            </label>
            <input
              id="perfil-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={!canEdit || guardando}
              minLength={2}
              maxLength={40}
              autoComplete="given-name"
              className="mt-1.5 w-full rounded-lg border border-geo-border bg-geo-input px-4 py-2.5 text-sm text-geo-navy outline-none transition focus:border-geo-pink focus:ring-1 focus:ring-geo-pink/20 disabled:bg-geo-surface disabled:text-geo-muted"
            />
          </div>

          <div>
            <label htmlFor="perfil-apellidos" className="text-sm font-medium text-geo-navy">
              Apellidos
            </label>
            <input
              id="perfil-apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              disabled={!canEdit || guardando}
              maxLength={40}
              autoComplete="family-name"
              className="mt-1.5 w-full rounded-lg border border-geo-border bg-geo-input px-4 py-2.5 text-sm text-geo-navy outline-none transition focus:border-geo-pink focus:ring-1 focus:ring-geo-pink/20 disabled:bg-geo-surface disabled:text-geo-muted"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {mensaje && (
          <p className="mt-4 text-sm text-emerald-700" role="status">
            {mensaje}
          </p>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={!puedeGuardar || guardando}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg bg-geo-pink px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-geo-pink-hover disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function resolvePerfilNameFields(input: {
  nombre: string;
  firstName?: string;
  lastName?: string;
}): { firstName: string; lastName: string } {
  if (input.firstName?.trim()) {
    return {
      firstName: input.firstName.trim(),
      lastName: (input.lastName ?? "").trim(),
    };
  }

  return splitFullName(input.nombre);
}
