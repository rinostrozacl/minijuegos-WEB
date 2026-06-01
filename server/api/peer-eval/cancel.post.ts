import { getFirestore } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";
import { deleteEvalSubcollections } from "../../utils/peerEvalAssignment";
import { getPeerEvalRef } from "../../utils/peerEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const body = await readBody(event);
  const evalId = String(body?.evalId || "");
  const confirm = Boolean(body?.confirm);

  if (!evalId) {
    throw createError({ statusCode: 400, statusMessage: "evalId requerido" });
  }
  if (!confirm) {
    throw createError({
      statusCode: 400,
      statusMessage: "Se requiere confirm: true para eliminar",
    });
  }

  const { db, ref } = await getPeerEvalRef(evalId);
  await deleteEvalSubcollections(db, evalId);
  await ref.delete();

  return { success: true };
});
