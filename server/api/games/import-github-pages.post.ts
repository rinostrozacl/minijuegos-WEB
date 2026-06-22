import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertThemeEditorFromRequest } from "../../utils/themeEditorAccess";
import { validateGithubPagesPlayUrl } from "../../utils/githubPagesPlay";
import {
  isAllowedGithubPagesPlayUrl,
  normalizeGithubPagesPlayUrl,
} from "~/utils/gamePlayUrl";

const STATUS_PUBLICADO = "publicado";
const STATUS_EN_DESARROLLO = "en_desarrollo";

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
    const playUrlInput = normalizeGithubPagesPlayUrl(
      body?.playUrl?.toString?.() || ""
    );
    const dryRun = body?.dryRun === true;

    if (!themeId || !playUrlInput) {
      throw createError({
        statusCode: 400,
        statusMessage: "themeId y playUrl (GitHub Pages) son requeridos",
      });
    }

    if (!isAllowedGithubPagesPlayUrl(playUrlInput)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "URL inválida. Usa una URL pública de GitHub Pages (https://usuario.github.io/repo/).",
      });
    }

    await assertThemeEditorFromRequest(event, themeId);

    const validated = await validateGithubPagesPlayUrl(playUrlInput);

    if (!dryRun) {
      const db = getFirestore();
      const themeRef = db.collection("themes").doc(themeId);
      const snap = await themeRef.get();

      if (!snap.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: "Temática no encontrada",
        });
      }

      const current = snap.data() || {};
      const wasPublished = current.gameStatus === STATUS_PUBLICADO;

      await themeRef.update({
        gameWebGLUrl: validated.playUrl,
        gameStatus: wasPublished ? STATUS_PUBLICADO : STATUS_EN_DESARROLLO,
        lastUpdated: FieldValue.serverTimestamp(),
        gameLocalPath: FieldValue.delete(),
        gameFilesCount: FieldValue.delete(),
        gameUploadedAt: FieldValue.delete(),
        itchGameId: FieldValue.delete(),
      });
    }

    return {
      success: true,
      playUrl: validated.playUrl,
      saved: !dryRun,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string };
    console.error("[ImportGithubPages] Error:", error);

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage:
        err.statusMessage || "Error al importar desde GitHub Pages",
    });
  }
});
