import { FieldValue } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";
import {
  assertNoOtherActiveEval,
  getPeerEvalRef,
} from "../../utils/peerEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const body = await readBody(event);
  const evalId = String(body?.evalId || "");

  if (!evalId) {
    throw createError({ statusCode: 400, statusMessage: "evalId requerido" });
  }

  const { db, ref, data } = await getPeerEvalRef(evalId);

  if (data.status !== "generada" && data.status !== "pausada") {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se puede iniciar desde generada o pausada",
    });
  }

  await assertNoOtherActiveEval(db, evalId);

  await ref.update({
    status: "activa",
    isIntakeEnabled: true,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});
