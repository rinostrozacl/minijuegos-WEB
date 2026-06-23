import { getFirestoreDb } from "../plugins/firebase-admin";
import {
  readBearerTokenFromRequest,
  verifyFirebaseIdToken,
} from "./firebaseAuth";

/**
 * Verifica que el token sea del titular o compañero del tema reservado.
 */
export async function assertThemeEditorFromRequest(
  event: { node: { req: { headers: Record<string, string | string[] | undefined> } } },
  themeId: string
): Promise<{ uid: string; email?: string }> {
  if (!themeId || !/^[a-zA-Z0-9_-]+$/.test(themeId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "themeId inválido",
    });
  }

  const idToken = readBearerTokenFromRequest(event);
  const decoded = await verifyFirebaseIdToken(idToken);

  const db = getFirestoreDb();
  const snap = await db.collection("themes").doc(themeId).get();
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: "Tema no encontrado" });
  }

  const d = snap.data()!;
  if (d.available === true) {
    throw createError({
      statusCode: 400,
      statusMessage: "La temática no está reservada",
    });
  }

  const uid = decoded.uid;
  if (d.reservedById === uid || d.teammateUid === uid) {
    return { uid, email: decoded.email };
  }

  throw createError({
    statusCode: 403,
    statusMessage: "No tienes permiso para esta operación",
  });
}
