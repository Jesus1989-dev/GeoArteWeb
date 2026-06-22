/** Evita pantallas de carga infinita si Supabase no responde. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label}: la consulta tardó demasiado (${Math.round(ms / 1000)}s)`));
      }, ms);
    }),
  ]);
}
