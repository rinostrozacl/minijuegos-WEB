import { assertAdminFromRequest } from "../../utils/peerEvalAuth";
import { runGenerateAssignments } from "../../utils/peerEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const body = await readBody(event);
  const evalId = String(body?.evalId || "");

  if (!evalId) {
    throw createError({ statusCode: 400, statusMessage: "evalId requerido" });
  }

  const result = await runGenerateAssignments(evalId);

  return { success: true, ...result };
});
