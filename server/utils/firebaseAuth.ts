import { createError, isError } from "h3";
import { getApp, getApps } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { ensureFirebaseAdmin } from "../plugins/firebase-admin";
import { firebaseCredentialConfigHint } from "./firebaseAdminCredentials";

function isCredentialError(text: string): boolean {
  return /invalid-credential|Invalid PEM|private key|DECODER routines|unsupported|Getting metadata from plugin failed/i.test(
    text
  );
}

async function getAdminAuth() {
  await ensureFirebaseAdmin();

  if (getApps().length === 0) {
    throw createError({
      statusCode: 503,
      message: `Firebase Admin no está inicializado. ${firebaseCredentialConfigHint()}`,
    });
  }

  return getAuth(getApp());
}

function mapVerifyIdTokenError(error: unknown): never {
  const e = error as { code?: string | number; message?: string };
  const text = `${e.code ?? ""} ${e.message ?? ""} ${String(error)}`;
  console.error("[FirebaseAuth] verifyIdToken:", e.code ?? "unknown", e.message ?? error);

  if (isCredentialError(text)) {
    throw createError({
      statusCode: 503,
      message: `Credenciales Firebase Admin inválidas en el servidor. ${firebaseCredentialConfigHint()}`,
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
      message: "Token de autenticación inválido.",
    });
  }

  throw createError({
    statusCode: 401,
    message: "No se pudo verificar la sesión. Vuelve a iniciar sesión.",
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
