import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertThemeEditorFromRequest } from "../../utils/themeEditorAccess";
import { validateGithubPagesPlayUrl } from "../../utils/githubPagesPlay";
import {
  isAllowedGithubPagesPlayUrl,
  normalizeGithubPagesPlayUrl,
  normalizeItchInputUrl,
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
    const itchAnnexUrl = body?.itchPageUrl
      ? normalizeItchInputUrl(body.itchPageUrl.toString())
      : null;
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

    if (body?.itchPageUrl && !itchAnnexUrl) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "El enlace anexo a itch.io no es válido. Usa la página pública del juego.",
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

      const update: Record<string, unknown> = {
        gameWebGLUrl: validated.playUrl,
        gameStatus: wasPublished ? STATUS_PUBLICADO : STATUS_EN_DESARROLLO,
        lastUpdated: FieldValue.serverTimestamp(),
        gameLocalPath: FieldValue.delete(),
        gameFilesCount: FieldValue.delete(),
        gameUploadedAt: FieldValue.delete(),
        itchGameId: FieldValue.delete(),
      };

      if (itchAnnexUrl) {
        update.gameUrl = itchAnnexUrl;
      } else {
        update.gameUrl = FieldValue.delete();
      }

      await themeRef.update(update);
    }

    return {
      success: true,
      playUrl: validated.playUrl,
      itchPageUrl: itchAnnexUrl,
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
