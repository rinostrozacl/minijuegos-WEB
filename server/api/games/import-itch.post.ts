import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { assertThemeEditorFromRequest } from "../../utils/themeEditorAccess";
import { resolveItchEmbedFromPageUrl } from "../../utils/itchEmbed";
import { isAllowedItchInputUrl, normalizeItchInputUrl } from "~/utils/gamePlayUrl";

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
    const itchPageUrl = normalizeItchInputUrl(
      body?.itchPageUrl?.toString?.() || ""
    );
    const dryRun = body?.dryRun === true;

    if (!themeId || !itchPageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: "themeId e itchPageUrl son requeridos",
      });
    }

    if (!isAllowedItchInputUrl(itchPageUrl)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "URL inválida. Usa la página pública de tu juego en itch.io.",
      });
    }

    await assertThemeEditorFromRequest(event, themeId);

    const resolved = await resolveItchEmbedFromPageUrl(itchPageUrl);

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
        gameUrl: resolved.pageUrl,
        gameWebGLUrl: resolved.playUrl,
        itchGameId: resolved.gameId,
        gameStatus: wasPublished ? STATUS_PUBLICADO : STATUS_EN_DESARROLLO,
        lastUpdated: FieldValue.serverTimestamp(),
        gameLocalPath: FieldValue.delete(),
        gameFilesCount: FieldValue.delete(),
        gameUploadedAt: FieldValue.delete(),
      });
    }

    return {
      success: true,
      pageUrl: resolved.pageUrl,
      playUrl: resolved.playUrl,
      gameId: resolved.gameId,
      saved: !dryRun,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string };
    console.error("[ImportItch] Error:", error);

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Error al importar desde itch.io",
    });
  }
});
