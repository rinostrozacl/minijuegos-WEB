import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import { getFinalEvalDb } from "../../../utils/finalEvalService";
import { normalizeFinalEvalEmail } from "../../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  const db = getFinalEvalDb();
  const snap = await db.collection("finalEvalAllowedEmails").get();

  const emails = snap.docs
    .map((doc) => ({
      id: doc.id,
      email: normalizeFinalEvalEmail(String(doc.data().email || "")),
      enabled: doc.data().enabled !== false,
      createdAt: doc.data().createdAt,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return { emails };
});
