import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    // Verificar que sea POST
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

    console.log(`[Delete] Eliminando juego para tema: ${themeId}`);

    // Ruta del juego
    const gamesDir = path.join(process.cwd(), "public", "games");
    const gameDir = path.join(gamesDir, themeId);

    // Verificar que existe la carpeta
    const dirExists = await fs
      .access(gameDir)
      .then(() => true)
      .catch(() => false);

    if (!dirExists) {
      console.log(`[Delete] La carpeta del juego no existe: ${gameDir}`);
      return {
        success: true,
        message: "El juego ya no existe en el sistema",
      };
    }

    // Función recursiva para eliminar directorio y todo su contenido
    const removeDirectory = async (dirPath: string) => {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          await removeDirectory(itemPath);
        } else {
          await fs.unlink(itemPath);
          console.log(`[Delete] Archivo eliminado: ${item.name}`);
        }
      }

      await fs.rmdir(dirPath);
    };

    // Eliminar el directorio completo
    await removeDirectory(gameDir);

    console.log(`[Delete] ✅ Juego eliminado exitosamente: ${themeId}`);

    return {
      success: true,
      themeId,
      message: `Juego eliminado exitosamente del sistema local`,
    };
  } catch (error: any) {
    console.error("[Delete] Error eliminando juego:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error interno del servidor",
    });
  }
});
