import { FieldValue } from "firebase-admin/firestore";
import { assertAdminFromRequest } from "../../../../utils/finalEvalAuth";
import { getFinalEvalDb } from "../../../../utils/finalEvalService";
import {
  emailToDocId,
  isValidFinalEvalEmailFormat,
  normalizeFinalEvalEmail,
} from "../../../../utils/finalEvalTypes";

export default defineEventHandler(async (event) => {
  const admin = await assertAdminFromRequest(event);
  const body = await readBody(event);
  const raw = String(body?.text || body?.emails || "");
  const lines = raw
    .split(/[\n,;]+/)
    .map((l) => normalizeFinalEvalEmail(l))
    .filter(Boolean);

  if (lines.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No se encontraron correos en el listado",
    });
  }

  const db = getFinalEvalDb();
  const added: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  for (const email of lines) {
    if (!isValidFinalEvalEmailFormat(email)) {
      invalid.push(email);
      continue;
    }
    const docId = emailToDocId(email);
    const existing = await db.collection("finalEvalAllowedEmails").doc(docId).get();
    if (existing.exists && existing.data()?.enabled !== false) {
      duplicates.push(email);
      continue;
    }
    await db.collection("finalEvalAllowedEmails").doc(docId).set({
      email,
      enabled: true,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: admin.email,
    });
    added.push(email);
  }

  return { success: true, added, invalid, duplicates };
});
