import { createError, isError } from "h3";
import { getApp, getApps } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

function getAdminAuth() {
  if (getApps().length === 0) {
    throw createError({
      statusCode: 503,
      message:
        "Firebase Admin no está inicializado en el servidor. Revisa FIREBASE_* en Coolify.",
    });
  }
  return getAuth(getApp());
}

function mapVerifyIdTokenError(error: unknown): never {
  const e = error as { code?: string; message?: string };
  console.error("[FirebaseAuth] verifyIdToken:", e.code || "unknown", e.message || error);

  if (e.code === "auth/id-token-expired") {
    throw createError({
      statusCode: 401,
      message: "Sesión expirada. Cierra sesión y vuelve a ingresar.",
    });
  }
  if (e.code === "auth/id-token-revoked") {
    throw createError({
      statusCode: 401,
      message: "Sesión revocada. Vuelve a iniciar sesión.",
    });
  }
  if (e.code === "auth/argument-error") {
    throw createError({
      statusCode: 401,
      message:
        "Token de autenticación inválido. Si pruebas desde Postman, copia el Bearer desde la pestaña Red del navegador tras iniciar sesión.",
    });
  }

  throw createError({
    statusCode: 401,
    message: "Token inválido. Cierra sesión, vuelve a ingresar e intenta de nuevo.",
  });
}

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  try {
    return await getAdminAuth().verifyIdToken(idToken, true);
  } catch (error) {
    if (isError(error)) throw error;
    mapVerifyIdTokenError(error);
  }
}

export function readBearerTokenFromRequest(event: {
  node: { req: { headers: Record<string, string | string[] | undefined> } };
}): string {
  const raw =
    event.node.req.headers.authorization ||
    event.node.req.headers.Authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header?.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Se requiere autenticación",
    });
  }

  const idToken = header.slice(7).trim();
  if (!idToken) {
    throw createError({ statusCode: 401, statusMessage: "Token vacío" });
  }

  return idToken;
}
