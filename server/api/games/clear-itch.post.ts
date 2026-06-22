import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertThemeEditorFromRequest } from "../../utils/themeEditorAccess";

export default defineEventHandler(async (event) => {
  try {
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Método no permitido",
      });
    }

    const body = await readBody(event);
    const themeId = body?.themeId?.toString?.();

    if (!themeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "themeId es requerido",
      });
    }

    await assertThemeEditorFromRequest(event, themeId);

    const db = getFirestore();
    const themeRef = db.collection("themes").doc(themeId);

    await themeRef.update({
      gameUrl: FieldValue.delete(),
      gameWebGLUrl: FieldValue.delete(),
      itchGameId: FieldValue.delete(),
      gameLocalPath: FieldValue.delete(),
      gameFilesCount: FieldValue.delete(),
      gameUploadedAt: FieldValue.delete(),
      lastUpdated: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      themeId,
      message: "Enlace a itch.io eliminado de GameCraft",
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string };
    console.error("[ClearItch] Error:", error);

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Error al quitar el enlace",
    });
  }
});
