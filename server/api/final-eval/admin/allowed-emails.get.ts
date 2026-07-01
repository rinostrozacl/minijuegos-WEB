import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import {
  getFinalEvalDb,
  getFinalEvalRatingCountsByEmail,
} from "../../../utils/finalEvalService";
import { normalizeFinalEvalEmail } from "../../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const db = getFinalEvalDb();
  const [snap, ratingCounts] = await Promise.all([
    db.collection("finalEvalAllowedEmails").get(),
    getFinalEvalRatingCountsByEmail(),
  ]);

  const emails = snap.docs
    .map((doc) => ({
      id: doc.id,
      email: normalizeFinalEvalEmail(String(doc.data().email || "")),
      enabled: doc.data().enabled !== false,
      ratingCount: ratingCounts.get(
        normalizeFinalEvalEmail(String(doc.data().email || ""))
      ) || 0,
      createdAt: doc.data().createdAt,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return { emails };
});
