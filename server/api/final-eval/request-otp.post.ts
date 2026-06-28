import { sendFinalEvalOtpEmail } from "../../utils/email";
import {
  assertFinalEvalOpen,
  checkOtpRateLimit,
  createFinalEvalOtp,
  getClientIp,
  isEmailInFinalEvalAllowlist,
  recordOtpRequest,
} from "../../utils/finalEvalService";
import {
  isValidFinalEvalEmailFormat,
  normalizeFinalEvalEmail,
} from "../../utils/finalEvalTypes";

const GENERIC_MESSAGE =
  "Si el correo está autorizado, recibirás un código de verificación en los próximos minutos.";

export default defineEventHandler(async (event) => {
  try {
    await assertFinalEvalOpen();
    const body = await readBody(event);
    const email = normalizeFinalEvalEmail(String(body?.email || ""));

    if (!isValidFinalEvalEmailFormat(email)) {
      return { success: true, message: GENERIC_MESSAGE };
    }

    const ip = getClientIp(event);
    await checkOtpRateLimit(email, ip);

    const allowed = await isEmailInFinalEvalAllowlist(email);
    if (!allowed) {
      return { success: true, message: GENERIC_MESSAGE };
    }

    await recordOtpRequest(email, ip);
    const code = await createFinalEvalOtp(email);
    await sendFinalEvalOtpEmail(email, code);

    return { success: true, message: GENERIC_MESSAGE };
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string };
    if (e.statusCode === 429) {
      throw error;
    }
    console.error("[final-eval] request-otp:", error);
    return { success: true, message: GENERIC_MESSAGE };
  }
});
