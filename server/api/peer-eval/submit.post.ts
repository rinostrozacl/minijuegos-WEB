import { FieldValue } from "firebase-admin/firestore";
import { verifyIdTokenFromRequest } from "../../utils/peerEvalAuth";
import {
  averagePeerScores,
  validatePeerScores,
  type PeerEvalScores,
} from "../../utils/peerEvalTypes";
import { getPeerEvalRef } from "../../utils/peerEvalService";

export default defineEventHandler(async (event) => {
  const user = await verifyIdTokenFromRequest(event);
  const body = await readBody(event);

  const evalId = String(body?.evalId || "");
  const gameId = String(body?.gameId || "");
  const scores = body?.scores as Partial<PeerEvalScores>;
  const likedMost = String(body?.likedMost || "").trim();
  const likedLeast = String(body?.likedLeast || "").trim();

  if (!evalId || !gameId) {
    throw createError({
      statusCode: 400,
      statusMessage: "evalId y gameId son requeridos",
    });
  }

  if (!validatePeerScores(scores)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cada criterio debe ser un entero entre 1 y 7",
    });
  }

  if (!likedMost || !likedLeast) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ambos comentarios son obligatorios",
    });
  }

  const { db, data } = await getPeerEvalRef(evalId);

  if (data.status !== "activa" || !data.isIntakeEnabled) {
    throw createError({
      statusCode: 400,
      statusMessage: "La evaluación no está abierta para ingreso de notas",
    });
  }

  const assignRef = db
    .collection("peerEvaluations")
    .doc(evalId)
    .collection("assignments")
    .doc(user.uid);
  const assignSnap = await assignRef.get();

  if (!assignSnap.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: "No tienes asignaciones en esta evaluación",
    });
  }

  const assignment = assignSnap.data()!;
  const assigned: string[] = assignment.assignedGameIds || [];

  if (!assigned.includes(gameId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Este juego no está en tu asignación",
    });
  }

  const completed: string[] = assignment.completedGameIds || [];
  if (completed.includes(gameId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ya evaluaste este juego",
    });
  }

  const submissionId = `${user.uid}_${gameId}`;
  const subRef = db
    .collection("peerEvaluations")
    .doc(evalId)
    .collection("submissions")
    .doc(submissionId);

  const existing = await subRef.get();
  if (existing.exists) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ya existe una evaluación para este juego",
    });
  }

  const averageScore = averagePeerScores(scores);

  await subRef.set({
    evaluatorUid: user.uid,
    gameId,
    scores,
    likedMost,
    likedLeast,
    averageScore,
    submittedAt: FieldValue.serverTimestamp(),
  });

  await assignRef.update({
    completedGameIds: FieldValue.arrayUnion(gameId),
  });

  return { success: true, averageScore };
});
