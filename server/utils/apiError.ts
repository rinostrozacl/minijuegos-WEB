import { createError, isError } from "h3";

function isFirestoreAuthError(error: unknown): boolean {
  const e = error as { code?: number; message?: string; details?: string };
  const text = `${e.message || ""} ${e.details || ""}`;
  return e.code === 16 || /UNAUTHENTICATED/i.test(text);
}

function isFirestorePermissionError(error: unknown): boolean {
  const e = error as { code?: number; message?: string; details?: string };
  const text = `${e.message || ""} ${e.details || ""}`;
  return e.code === 7 || /PERMISSION_DENIED/i.test(text);
}

/** Re-lanza H3Error; mapea errores de Firestore/gRPC a mensajes útiles. */
export function rethrowOrMapApiError(error: unknown, fallback: string): never {
  if (isError(error)) {
    throw error;
  }

  const e = error as { message?: string; statusCode?: number; statusMessage?: string };

  if (isFirestoreAuthError(error)) {
    throw createError({
      statusCode: 503,
      message:
        "Firestore rechazó las credenciales del servidor (UNAUTHENTICATED). " +
        "Revisa FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en Coolify " +
        "(sin comillas rotas; los saltos de línea como \\n). Si rotaste la clave en Firebase, genera una nueva.",
    });
  }

  if (isFirestorePermissionError(error)) {
    throw createError({
      statusCode: 503,
      message:
        "La cuenta de servicio no tiene permiso para acceder a Firestore. " +
        "Asigna el rol «Cloud Datastore User» o «Firebase Admin SDK Administrator Service Agent».",
    });
  }

  throw createError({
    statusCode: e.statusCode || 500,
    message: e.statusMessage || e.message || fallback,
  });
}
