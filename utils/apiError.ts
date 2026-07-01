/**
 * Extrae un mensaje legible de errores de $fetch / createError (H3).
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error"
): string {
  if (!error || typeof error !== "object") return fallback;

  const e = error as {
    data?: { statusMessage?: string; message?: string };
    statusMessage?: string;
    message?: string;
  };

  const fromData = e.data?.statusMessage || e.data?.message;
  if (fromData) return fromData;

  if (e.statusMessage) return e.statusMessage;

  const msg = e.message;
  if (msg && !/^\[(GET|POST|PUT|PATCH|DELETE)\]/i.test(msg)) {
    return msg;
  }

  return fallback;
}
