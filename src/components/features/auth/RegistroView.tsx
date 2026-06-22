"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authRedirects, authRoutes } from "@/lib/data/mock/auth";
import { AuthRolePicker } from "@/components/features/auth/AuthRolePicker";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { Button } from "@/components/shared/Button";
import { useAuth } from "@/contexts/AuthProvider";
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth";
import type { RolPerfil } from "@/lib/data/mock/perfil";
import type { AuthPageData } from "@/lib/services/auth.service";

type RegistroViewProps = {
  data: AuthPageData;
};

function toUpperField(value: string, upper: boolean): string {
  const trimmed = value.trim();
  return upper ? trimmed.toUpperCase() : trimmed;
}

export function RegistroView({ data }: RegistroViewProps) {
  const { register, session, ready, usesSupabase } = useAuth();
  const router = useRouter();
  const { registroCopy, roles, roleDescriptions } = data;

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [areaInvestigacion, setAreaInvestigacion] = useState("");
  const [cargo, setCargo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [rol, setRol] = useState<RolPerfil>("ciudadano");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAutoridad = rol === "autoridad";
  const isInvestigador = rol === "investigador";
  const needsInstitucion = isInvestigador || isAutoridad;
  const usesUppercaseFields = isAutoridad || isInvestigador;

  function handleRolChange(nextRol: RolPerfil) {
    setRol(nextRol);
    if (nextRol !== "autoridad") {
      setCargo("");
    }
    if (nextRol !== "investigador") {
      setAreaInvestigacion("");
    }
    if (nextRol !== "investigador" && nextRol !== "autoridad") {
      setInstitucion("");
    }
  }

  useEffect(() => {
    if (!ready || session == null) return;
    if (session.emailVerified === false) {
      const dest = `${authRoutes.verificar}?email=${encodeURIComponent(session.email)}`;
      if (navigateAfterAuth(dest, { usesSupabase, replace: true })) return;
      router.replace(dest);
      return;
    }
    const dest = authRedirects[session.rol];
    if (navigateAfterAuth(dest, { usesSupabase, replace: true })) return;
    router.replace(dest);
  }, [ready, session, router, usesSupabase]);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-geo-navy outline-none transition placeholder:text-gray-400 focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15";
  const labelClass =
    "text-xs font-semibold uppercase tracking-wide text-geo-navy";
  const uppercaseInputClass = usesUppercaseFields ? `${inputClass} uppercase` : inputClass;

  function handleUppercaseChange(
    value: string,
    setter: (value: string) => void,
  ) {
    setter(usesUppercaseFields ? value.toUpperCase() : value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const err = await register({
      nombre: toUpperField(nombre, usesUppercaseFields),
      email,
      password,
      confirmPassword,
      rol,
      institucion: needsInstitucion
        ? toUpperField(institucion, usesUppercaseFields)
        : undefined,
      areaInvestigacion: isInvestigador
        ? toUpperField(areaInvestigacion, true)
        : undefined,
      cargo: isAutoridad ? toUpperField(cargo, true) : undefined,
      aceptaTerminos,
    });
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-geo-navy">{registroCopy.titulo}</h1>
        <p className="mt-2 text-sm text-geo-muted">{registroCopy.subtitulo}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AuthRolePicker
            roles={roles}
            descriptions={roleDescriptions}
            value={rol}
            onChange={handleRolChange}
            label={registroCopy.rolLabel}
          />

          <div>
            <label htmlFor="reg-nombre" className={labelClass}>
              {isInvestigador
                ? registroCopy.nombreInvestigadorLabel
                : registroCopy.nombreLabel}
            </label>
            <input
              id="reg-nombre"
              type="text"
              autoComplete="name"
              required
              value={nombre}
              onChange={(e) => handleUppercaseChange(e.target.value, setNombre)}
              placeholder={registroCopy.nombrePlaceholder}
              className={uppercaseInputClass}
            />
          </div>

          <div>
            <label htmlFor="reg-email" className={labelClass}>
              {registroCopy.emailLabel}
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={registroCopy.emailPlaceholder}
              className={inputClass}
            />
          </div>

          {needsInstitucion && (
            <div>
              <label htmlFor="reg-institucion" className={labelClass}>
                {registroCopy.institucionOrganizacionLabel}
              </label>
              <input
                id="reg-institucion"
                type="text"
                required
                value={institucion}
                onChange={(e) => handleUppercaseChange(e.target.value, setInstitucion)}
                placeholder={registroCopy.institucionOrganizacionPlaceholder}
                className={uppercaseInputClass}
              />
            </div>
          )}

          {isInvestigador && (
            <div>
              <label htmlFor="reg-area-investigacion" className={labelClass}>
                {registroCopy.areaInvestigacionLabel}
              </label>
              <input
                id="reg-area-investigacion"
                type="text"
                required
                value={areaInvestigacion}
                onChange={(e) => setAreaInvestigacion(e.target.value.toUpperCase())}
                placeholder={registroCopy.areaInvestigacionPlaceholder}
                className={`${inputClass} uppercase`}
              />
            </div>
          )}

          {isAutoridad && (
            <div>
              <label htmlFor="reg-cargo" className={labelClass}>
                {registroCopy.cargoLabel}
              </label>
              <input
                id="reg-cargo"
                type="text"
                required
                value={cargo}
                onChange={(e) => setCargo(e.target.value.toUpperCase())}
                placeholder={registroCopy.cargoPlaceholder}
                className={`${inputClass} uppercase`}
              />
            </div>
          )}

          <div>
            <label htmlFor="reg-password" className={labelClass}>
              {registroCopy.passwordLabel}
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={registroCopy.passwordPlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="reg-confirm" className={labelClass}>
              {registroCopy.confirmLabel}
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={registroCopy.confirmPlaceholder}
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-geo-border bg-geo-surface/40 px-3 py-3">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-geo-border text-geo-pink focus:ring-geo-pink/30"
              required
            />
            <span className="text-sm leading-relaxed text-geo-muted">
              {registroCopy.terminosPrefix}{" "}
              <Link
                href={registroCopy.terminosServicioHref}
                className="font-medium text-geo-pink hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {registroCopy.terminosServicioLabel}
              </Link>{" "}
              {registroCopy.terminosMiddle}{" "}
              <Link
                href={registroCopy.privacidadHref}
                className="font-medium text-geo-pink hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {registroCopy.privacidadLabel}
              </Link>
              .
            </span>
          </label>

          {error != null && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || !aceptaTerminos}
          >
            {loading ? "Creando cuenta…" : registroCopy.submitLabel}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-geo-muted">
          {registroCopy.loginPrompt}{" "}
          <Link href="/login" className="font-medium text-geo-pink hover:underline">
            {registroCopy.loginLink}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
