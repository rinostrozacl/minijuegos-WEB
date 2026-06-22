import { assertThemeEditorFromRequest } from "../../utils/themeEditorAccess";
import { clearGameDir } from "../../utils/gameUpload";

export default defineEventHandler(async (event) => {
  try {
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed",
      });
    }

    const body = await readBody(event);
    const { themeId } = body;

    if (!themeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Theme ID is required",
      });
    }

    await assertThemeEditorFromRequest(event, themeId);

    console.log(`[Delete] Eliminando juego para tema: ${themeId}`);

    await clearGameDir(themeId);

    console.log(`[Delete] Juego eliminado exitosamente: ${themeId}`);

    return {
      success: true,
      themeId,
      message: "Juego eliminado exitosamente del sistema local",
    };
  } catch (error: any) {
    console.error("[Delete] Error eliminando juego:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error interno del servidor",
    });
  }
});
