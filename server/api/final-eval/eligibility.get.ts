import { verifyIdTokenFromRequest } from "../../utils/finalEvalAuth";
import {
  getFinalEvalConfig,
  isEmailInFinalEvalAllowlist,
} from "../../utils/finalEvalService";
import { normalizeFinalEvalEmail } from "../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  const config = await getFinalEvalConfig();

  if (config.status !== "abierta") {
    return {
      status: config.status,
      canEvaluate: false,
      skipOtp: false,
    };
  }

  const authHeader =
    event.node.req.headers.authorization ||
    event.node.req.headers.Authorization;
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (header?.startsWith("Bearer ")) {
    try {
      const user = await verifyIdTokenFromRequest(event);
      const email = normalizeFinalEvalEmail(user.email || "");
      const allowed = email ? await isEmailInFinalEvalAllowlist(email) : false;
      return {
        status: config.status,
        canEvaluate: allowed,
        skipOtp: allowed,
        email: allowed ? email : undefined,
      };
    } catch {
      return { status: config.status, canEvaluate: false, skipOtp: false };
    }
  }

  return { status: config.status, canEvaluate: true, skipOtp: false };
});
