import { FieldValue } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import {
  ensureFinalEvalConfigDoc,
  getFinalEvalDb,
} from "../../../utils/finalEvalService";
import type { FinalEvalStatus } from "../../../utils/finalEvalTypes";

const VALID: FinalEvalStatus[] = ["cerrada", "abierta", "finalizada"];

export default defineEventHandler(async (event) => {
  const admin = await assertAdminFromRequest(event);
  const body = await readBody(event);
  const status = String(body?.status || "") as FinalEvalStatus;
  const introText =
    body?.introText !== undefined ? String(body.introText) : undefined;
  const lowVotesThreshold =
    body?.lowVotesThreshold !== undefined
      ? Number(body.lowVotesThreshold)
      : undefined;

  if (!VALID.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Estado inválido",
    });
  }

  await ensureFinalEvalConfigDoc();
  const db = getFinalEvalDb();
  const update: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: admin.email,
  };
  if (introText !== undefined) update.introText = introText;
  if (
    lowVotesThreshold !== undefined &&
    Number.isFinite(lowVotesThreshold) &&
    lowVotesThreshold >= 0
  ) {
    update.lowVotesThreshold = lowVotesThreshold;
  }

  await db.collection("finalEvalConfig").doc("system").set(update, { merge: true });

  return { success: true, status };
});
