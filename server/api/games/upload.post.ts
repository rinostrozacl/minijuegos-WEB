import { MAX_GAME_UPLOAD_BYTES } from "~/utils/gameUpload";
import { assertThemeEditorFromRequest } from "../../utils/themeEditorAccess";
import {
  assertZipUploadFile,
  extractZipToGameDir,
} from "../../utils/gameUpload";

export default defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Método no permitido",
      });
    }

    const formData = await readMultipartFormData(event, {
      maxFileSize: MAX_GAME_UPLOAD_BYTES + 512 * 1024,
    });
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: "No se recibieron datos",
      });
    }

    const gameFile = formData.find((item) => item.name === "gameFile");
    const themeIdField = formData.find((item) => item.name === "themeId");

    if (!gameFile || !themeIdField) {
      throw createError({
        statusCode: 400,
        statusMessage: "Archivo ZIP y themeId son requeridos",
      });
    }

    const themeId = themeIdField.data.toString();
    await assertThemeEditorFromRequest(event, themeId);

    const originalFileName = gameFile.filename || "game.zip";
    const fileBuffer = Buffer.from(gameFile.data);

    assertZipUploadFile(originalFileName, fileBuffer.length);

    console.log(
      `[Upload] Procesando ZIP: ${originalFileName} (${fileBuffer.length} bytes) para tema: ${themeId}`
    );

    const { filesUploaded, totalBytes, gameUrl } = await extractZipToGameDir(
      themeId,
      fileBuffer
    );

    console.log(
      `[Upload] Completado: ${filesUploaded} archivos, ${totalBytes} bytes → ${gameUrl}`
    );

    return {
      success: true,
      gameUrl,
      filesUploaded,
      themeId,
      message: `Build subido: ${filesUploaded} archivo(s)`,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string };
    console.error("[Upload] Error:", error);

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Error interno del servidor",
    });
  }
});
