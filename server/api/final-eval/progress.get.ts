import { resolveEvaluatorFromRequest } from "../../utils/finalEvalAuth";
import {
  getFinalEvalDb,
  getPublishedGameIds,
  ratingDocId,
} from "../../utils/finalEvalService";

export default defineEventHandler(async (event) => {
  const evaluator = await resolveEvaluatorFromRequest(event);
  const db = getFinalEvalDb();
  const published = await getPublishedGameIds();
  const ratedSnap = await db
    .collection("finalEvalRatings")
    .where("email", "==", evaluator.email)
    .get();
  const ratedIds = new Set(ratedSnap.docs.map((d) => String(d.data().gameId)));

  return {
    totalPublished: published.length,
    ratedCount: ratedIds.size,
    pendingCount: published.filter((id) => !ratedIds.has(id)).length,
  };
});
