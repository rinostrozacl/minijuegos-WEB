import { resolveEvaluatorFromRequest } from "../../utils/finalEvalAuth";
import { submitFinalEvalRating } from "../../utils/finalEvalService";
import { validateFinalEvalScores, type FinalEvalScores } from "../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const gameId = String(body?.gameId || "").trim();
  const scores = body?.scores as Partial<FinalEvalScores>;

  if (!gameId) {
    throw createError({ statusCode: 400, statusMessage: "gameId requerido" });
  }

  if (!validateFinalEvalScores(scores)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Las cuatro calificaciones deben ser enteros de 1 a 5",
    });
  }

  const evaluator = await resolveEvaluatorFromRequest(event);

  await submitFinalEvalRating({
    email: evaluator.email,
    gameId,
    scores,
    evaluatorUid: evaluator.uid,
  });

  return { success: true };
});
