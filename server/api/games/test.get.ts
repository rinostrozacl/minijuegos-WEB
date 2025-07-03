import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    const gamesDir = path.join(process.cwd(), "public", "games");

    // Verificar que existe la carpeta games
    const dirExists = await fs
      .access(gamesDir)
      .then(() => true)
      .catch(() => false);
    if (!dirExists) {
      return {
        success: false,
        message: "La carpeta public/games no existe",
      };
    }

    // Listar contenido de la carpeta games
    const contents = await fs.readdir(gamesDir, { withFileTypes: true });

    const games = [];
    for (const item of contents) {
      if (item.isDirectory()) {
        const gameDir = path.join(gamesDir, item.name);

        // Buscar index.html
        const indexPath = path.join(gameDir, "index.html");
        const hasIndex = await fs
          .access(indexPath)
          .then(() => true)
          .catch(() => false);

        // Listar archivos en la carpeta del juego
        const gameFiles = await fs.readdir(gameDir).catch(() => []);

        games.push({
          name: item.name,
          hasIndex,
          gameUrl: hasIndex ? `/games/${item.name}/` : null,
          filesCount: gameFiles.length,
          files: gameFiles,
        });
      }
    }

    return {
      success: true,
      gamesFound: games.length,
      games,
      gamesDir,
      message: `Se encontraron ${games.length} juegos en el sistema local`,
    };
  } catch (error: any) {
    console.error("[GameTest] Error:", error);
    return {
      success: false,
      error: error.message,
      message: "Error al verificar el sistema de juegos local",
    };
  }
});
