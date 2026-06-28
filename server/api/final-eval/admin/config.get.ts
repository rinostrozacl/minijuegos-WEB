import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import {
  ensureFinalEvalConfigDoc,
  getFinalEvalConfig,
  getFinalEvalDb,
} from "../../../utils/finalEvalService";

export default defineEventHandler(async (event) => {
  await assertAdminFromRequest(event);
  await ensureFinalEvalConfigDoc();
  const config = await getFinalEvalConfig();
  const db = getFinalEvalDb();
  const allowSnap = await db
    .collection("finalEvalAllowedEmails")
    .where("enabled", "==", true)
    .get();

  return {
    status: config.status,
    introText: config.introText || "",
    lowVotesThreshold: config.lowVotesThreshold ?? 3,
    allowlistCount: allowSnap.size,
  };
});
