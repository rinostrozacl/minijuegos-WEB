import { createError, isError } from "h3";
import { getApp, getApps } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { ensureFirebaseAdmin } from "../plugins/firebase-admin";

async function getAdminAuth() {
  await ensureFirebaseAdmin();

  if (getApps().length === 0) {
    throw createError({
      statusCode: 503,
      message:
        "Firebase Admin no está inicializado en el servidor. " +
        "Configura FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY " +
        "en runtime de Coolify (o NUXT_FIREBASE_*).",
    });
  }

  return getAuth(getApp());
}

function mapVerifyIdTokenError(error: unknown): never {
  const e = error as { code?: string; message?: string };
  const text = `${e.code || ""} ${e.message || ""} ${String(error)}`;
  console.error("[FirebaseAuth] verifyIdToken:", e.code || "unknown", e.message || error);

  if (
    e.code === "app/invalid-credential" ||
    /Invalid PEM|private key|invalid-credential/i.test(text)
  ) {
    throw createError({
      statusCode: 503,
      message:
        "FIREBASE_PRIVATE_KEY mal formateada en el servidor. " +
        "En Coolify pégala en una línea con \\n entre BEGIN, el cuerpo y END, " +
        "o usa el campo private_key del JSON de Firebase sin modificar. " +
        "Luego reinicia el contenedor.",
    });
  }

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
    const auth = await getAdminAuth();
    return await auth.verifyIdToken(idToken, true);
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
