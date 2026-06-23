import { getAuth } from "firebase-admin/auth";
import { getFirestoreDb } from "../plugins/firebase-admin";

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

  const raw =
    event.node.req.headers.authorization ||
    event.node.req.headers.Authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header?.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Se requiere autenticación",
    });
  }

  const idToken = header.slice(7).trim();
  if (!idToken) {
    throw createError({ statusCode: 401, statusMessage: "Token vacío" });
  }

  let decoded: { uid: string; email?: string };
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Token inválido" });
  }

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
