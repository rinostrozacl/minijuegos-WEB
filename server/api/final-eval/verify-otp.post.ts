import {
  assertFinalEvalOpen,
  isEmailInFinalEvalAllowlist,
  verifyFinalEvalOtp,
} from "../../utils/finalEvalService";
import {
  isValidFinalEvalEmailFormat,
  normalizeFinalEvalEmail,
} from "../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  await assertFinalEvalOpen();
  const body = await readBody(event);
  const email = normalizeFinalEvalEmail(String(body?.email || ""));
  const code = String(body?.code || "").trim();

  if (!isValidFinalEvalEmailFormat(email) || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Correo y código son requeridos",
    });
  }

  const allowed = await isEmailInFinalEvalAllowlist(email);
  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: "No estás autorizado para evaluar",
    });
  }

  const { sessionId, expiresAt } = await verifyFinalEvalOtp(email, code);

  return {
    success: true,
    sessionId,
    expiresAt: expiresAt.toISOString(),
  };
});
