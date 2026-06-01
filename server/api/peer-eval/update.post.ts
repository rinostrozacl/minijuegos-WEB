import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../utils/peerEvalAuth";
import { getPeerEvalRef } from "../../utils/peerEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const body = await readBody(event);
  const evalId = String(body?.evalId || "");

  if (!evalId) {
    throw createError({ statusCode: 400, statusMessage: "evalId requerido" });
  }

  const { ref, data } = await getPeerEvalRef(evalId);
  if (data.status !== "borrador") {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se puede editar en estado borrador",
    });
  }

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: "El nombre no puede estar vacío" });
    }
    updates.name = name;
  }

  if (body.gamesPerEvaluator !== undefined) {
    const n = Number(body.gamesPerEvaluator);
    if (!Number.isInteger(n) || n < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "gamesPerEvaluator debe ser un entero >= 1",
      });
    }
    updates.gamesPerEvaluator = n;
  }

  if (body.gameIds !== undefined) {
    if (!Array.isArray(body.gameIds)) {
      throw createError({ statusCode: 400, statusMessage: "gameIds debe ser un array" });
    }
    updates.gameIds = body.gameIds.map(String);
  }

  await ref.update(updates);

  return { success: true };
});
