import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import { getFinalEvalDb } from "../../../utils/finalEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const query = getQuery(event);
  const id = String(query.id || query.email || "").trim();

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id requerido" });
  }

  const db = getFinalEvalDb();
  const ref = db.collection("finalEvalAllowedEmails").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: "Correo no encontrado" });
  }

  await ref.delete();
  return { success: true };
});
