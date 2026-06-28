import { FieldValue } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../../utils/finalEvalAuth";
import { getFinalEvalDb } from "../../../utils/finalEvalService";
import {
  emailToDocId,
  isValidFinalEvalEmailFormat,
  normalizeFinalEvalEmail,
} from "../../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  const admin = await assertAdminFromRequest(event);
  const body = await readBody(event);
  const email = normalizeFinalEvalEmail(String(body?.email || ""));

  if (!isValidFinalEvalEmailFormat(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Formato de correo inválido",
    });
  }

  const db = getFinalEvalDb();
  const docId = emailToDocId(email);
  await db.collection("finalEvalAllowedEmails").doc(docId).set({
    email,
    enabled: true,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: admin.email,
  });

  return { success: true, email, id: docId };
});
