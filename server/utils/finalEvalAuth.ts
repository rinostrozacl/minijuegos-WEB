import {
  readBearerTokenFromRequest,
  verifyFirebaseIdToken,
} from "./firebaseAuth";
import {
  assertAdminFromRequest,
  verifyIdTokenFromRequest,
} from "./peerEvalAuth";
import {
  isEmailInFinalEvalAllowlist,
  resolveSessionEmail,
} from "./finalEvalService";
import { normalizeFinalEvalEmail } from "./finalEvalTypes";

type AuthEvent = {
  node: { req: { headers: Record<string, string | string[] | undefined> } };
};

export function readSessionIdFromRequest(event: AuthEvent): string | null {
  const raw =
    event.node.req.headers["x-final-eval-session"] ||
    event.node.req.headers["X-Final-Eval-Session"];
  const header = Array.isArray(raw) ? raw[0] : raw;
  return header?.trim() || null;
}

export async function resolveEvaluatorFromRequest(
  event: AuthEvent
): Promise<{ email: string; uid?: string; viaSession: boolean }> {
  const sessionId = readSessionIdFromRequest(event);
  if (sessionId) {
    const email = await resolveSessionEmail(sessionId);
    const allowed = await isEmailInFinalEvalAllowlist(email);
    if (!allowed) {
      throw createError({
        statusCode: 403,
        statusMessage: "No estás autorizado para evaluar",
      });
    }
    return { email, viaSession: true };
  }

  const authHeader =
    event.node.req.headers.authorization ||
    event.node.req.headers.Authorization;
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (header?.startsWith("Bearer ")) {
    const user = await verifyIdTokenFromRequest(event);
    const email = normalizeFinalEvalEmail(user.email || "");
    if (!email) {
      throw createError({
        statusCode: 401,
        statusMessage: "Se requiere correo en la sesión",
      });
    }
    const allowed = await isEmailInFinalEvalAllowlist(email);
    if (!allowed) {
      throw createError({
        statusCode: 403,
        statusMessage: "No estás autorizado para evaluar",
      });
    }
    return { email, uid: user.uid, viaSession: false };
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Se requiere verificación o inicio de sesión",
  });
}

export { assertAdminFromRequest, verifyIdTokenFromRequest } from "./peerEvalAuth";