import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";

export default defineEventHandler(async (event) => {
  const admin = await assertAdminFromRequest(event);
  const body = await readBody(event);

  const name = String(body?.name || "").trim();
  const gamesPerEvaluator = Number(body?.gamesPerEvaluator ?? 3);
  const gameIds = Array.isArray(body?.gameIds)
    ? body.gameIds.map(String)
    : [];

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "El nombre es requerido" });
  }
  if (!Number.isInteger(gamesPerEvaluator) || gamesPerEvaluator < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "gamesPerEvaluator debe ser un entero >= 1",
    });
  }

  const db = getFirestore();
  const ref = db.collection("peerEvaluations").doc();

  await ref.set({
    name,
    status: "borrador",
    gameIds,
    gamesPerEvaluator,
    isIntakeEnabled: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: admin.email,
  });

  return { success: true, evalId: ref.id };
});
