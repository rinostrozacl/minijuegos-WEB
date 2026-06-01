import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type { PeerEvalStatus, PeerEvaluationDoc } from "./peerEvalTypes";
import {
  buildAssignments,
  collectEvaluatorUids,
  deleteEvalSubcollections,
  loadThemesAndUsers,
  persistAssignments,
} from "./peerEvalAssignment";

export async function getPeerEvalRef(evalId: string) {
  const db = getFirestore();
  const ref = db.collection("peerEvaluations").doc(evalId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: "Evaluación no encontrada" });
  }
  return { db, ref, snap, data: snap.data() as PeerEvaluationDoc };
}

export async function assertNoOtherActiveEval(
  db: FirebaseFirestore.Firestore,
  excludeEvalId?: string
) {
  const activeSnap = await db
    .collection("peerEvaluations")
    .where("status", "==", "activa")
    .get();

  const other = activeSnap.docs.filter((d) => d.id !== excludeEvalId);
  if (other.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Ya existe otra evaluación activa. Finalízala o pausala antes de iniciar otra.",
    });
  }
}

export async function runGenerateAssignments(
  evalId: string,
  options?: { reset?: boolean }
) {
  const { db, ref, data } = await getPeerEvalRef(evalId);

  if (data.status !== "borrador" && data.status !== "generada" && !options?.reset) {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se puede generar en borrador o al reiniciar",
    });
  }

  const gameIds = data.gameIds || [];
  if (gameIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Debe seleccionar al menos un juego",
    });
  }

  const gamesPerEvaluator = data.gamesPerEvaluator || 3;
  if (gamesPerEvaluator < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "gamesPerEvaluator debe ser al menos 1",
    });
  }

  if (options?.reset) {
    await deleteEvalSubcollections(db, evalId);
  }

  const { themesById, usersById, users } = await loadThemesAndUsers(db);

  const missingGames = gameIds.filter((id) => !themesById.has(id));
  if (missingGames.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Juegos no encontrados o no reservados: ${missingGames.join(", ")}`,
    });
  }

  const evaluatorUids = collectEvaluatorUids(gameIds, themesById, users);
  if (evaluatorUids.size === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No hay evaluadores elegibles (usuarios con temática reservada)",
    });
  }

  const result = buildAssignments(
    gameIds,
    gamesPerEvaluator,
    themesById,
    usersById,
    evaluatorUids
  );

  if (result.errors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: result.errors.slice(0, 5).join(" | "),
    });
  }

  if (result.evaluatorCount === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No se pudieron crear asignaciones",
    });
  }

  await persistAssignments(db, evalId, result.assignments);

  await ref.update({
    status: "generada" as PeerEvalStatus,
    assignmentSeed: result.seed,
    generatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    isIntakeEnabled: false,
  });

  return {
    evaluatorCount: result.evaluatorCount,
    assignmentSeed: result.seed,
  };
}
