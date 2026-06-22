"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { submitContactoForm } from "@/actions/contacto.actions";
import { Button } from "@/components/shared/Button";
import type { ContactoPageData } from "@/lib/services/contacto.service";

type ContactFormProps = {
  buzon: ContactoPageData["contactoBuzon"];
};

export function ContactForm({ buzon }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { campos, btnEnviar } = buzon;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const result = await submitContactoForm(new FormData(form));
    setLoading(false);

    if (result.ok) {
      setSuccessMessage(result.message);
      setSent(true);
      form.reset();
      return;
    }

    setError(result.message);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-medium text-emerald-900">Consulta enviada</p>
        <p className="mt-2 text-sm text-emerald-800">{successMessage}</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setSuccessMessage("");
            setError(null);
          }}
          className="mt-4 text-sm font-medium text-geo-pink hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-geo-navy outline-none transition placeholder:text-gray-400 focus:border-geo-pink focus:ring-2 focus:ring-geo-pink/15";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="nombre"
            className="block text-sm font-medium text-geo-navy"
          >
            {campos.nombre.label}
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            autoComplete="name"
            placeholder={campos.nombre.placeholder}
            className={inputClass}
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-geo-navy"
          >
            {campos.email.label}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={campos.email.placeholder}
            className={inputClass}
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <label htmlFor="asunto" className="block text-sm font-medium text-geo-navy">
          {campos.asunto.label}
        </label>
        <input
          id="asunto"
          name="asunto"
          type="text"
          required
          placeholder={campos.asunto.placeholder}
          className={inputClass}
          disabled={loading}
        />
      </div>
      <div>
        <label
          htmlFor="mensaje"
          className="block text-sm font-medium text-geo-navy"
        >
          {campos.mensaje.label}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          placeholder={campos.mensaje.placeholder}
          className={`${inputClass} resize-y`}
          disabled={loading}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
        )}
        {loading ? "Enviando…" : btnEnviar}
      </Button>
    </form>
  );
}
