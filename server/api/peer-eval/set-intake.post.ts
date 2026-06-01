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
  const enabled = Boolean(body?.enabled);

  if (!evalId) {
    throw createError({ statusCode: 400, statusMessage: "evalId requerido" });
  }

  const { db, ref, data } = await getPeerEvalRef(evalId);

  if (data.status !== "activa" && data.status !== "pausada") {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se puede cambiar ingreso en evaluación activa o pausada",
    });
  }

  if (enabled) {
    await assertNoOtherActiveEval(db, evalId);
  }

  await ref.update({
    status: enabled ? "activa" : "pausada",
    isIntakeEnabled: enabled,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, isIntakeEnabled: enabled };
});
