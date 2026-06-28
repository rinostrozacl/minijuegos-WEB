import { resolveEvaluatorFromRequest } from "../../utils/finalEvalAuth";
import { getFinalEvalDb } from "../../utils/finalEvalService";
import { ratingDocId } from "../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const gameId = String(query.gameId || "").trim();
  if (!gameId) {
    throw createError({ statusCode: 400, statusMessage: "gameId requerido" });
  }

  try {
    const evaluator = await resolveEvaluatorFromRequest(event);
    const db = getFinalEvalDb();
    const ref = db.collection("finalEvalRatings").doc(ratingDocId(evaluator.email, gameId));
    const snap = await ref.get();
    return {
      hasRated: snap.exists,
      email: evaluator.email,
    };
  } catch (error: unknown) {
    const e = error as { statusCode?: number };
    if (e.statusCode === 401 || e.statusCode === 403) {
      return { hasRated: false, authenticated: false };
    }
    throw error;
  }
});
