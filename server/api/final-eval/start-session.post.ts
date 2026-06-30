import {
  assertFinalEvalOpen,
  checkStartSessionRateLimit,
  createFinalEvalSession,
  getClientIp,
  isEmailInFinalEvalAllowlist,
  recordStartSessionRequest,
} from "../../utils/finalEvalService";
import {
  isValidFinalEvalEmailFormat,
  normalizeFinalEvalEmail,
} from "../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  await assertFinalEvalOpen();
  const body = await readBody(event);
  const email = normalizeFinalEvalEmail(String(body?.email || ""));

  if (!isValidFinalEvalEmailFormat(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ingresa un correo válido",
    });
  }

  const ip = getClientIp(event);
  await checkStartSessionRateLimit(ip);

  const allowed = await isEmailInFinalEvalAllowlist(email);
  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: "Este correo no está autorizado para evaluar",
    });
  }

  await recordStartSessionRequest(ip);
  const { sessionId, expiresAt } = await createFinalEvalSession(email);

  return {
    success: true,
    sessionId,
    email,
    expiresAt: expiresAt.toISOString(),
  };
});
