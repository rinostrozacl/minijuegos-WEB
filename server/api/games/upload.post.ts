import { promises as fs } from "fs";
import { join, dirname } from "path";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import JSZip from "jszip";

export default defineEventHandler(async (event) => {
  try {
    console.log("[Upload] 🚀 Iniciando upload directo HTTPS");

    // Solo permitir POST
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Método no permitido",
      });
    }

    // Leer datos del formulario
    const formData = await readMultipartFormData(event);
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: "No se recibieron datos",
      });
    }

    // Extraer archivo y themeId
    const gameFile = formData.find((item) => item.name === "gameFile");
    const themeIdField = formData.find((item) => item.name === "themeId");

    if (!gameFile || !themeIdField) {
      throw createError({
        statusCode: 400,
        statusMessage: "Archivo de juego y themeId son requeridos",
      });
    }

    const themeId = themeIdField.data.toString();
    const originalFileName = gameFile.filename || "game-files.zip";

    console.log(
      `[Upload] Procesando archivo: ${originalFileName} (${gameFile.data.length} bytes) para tema: ${themeId}`
    );

    // Directorio de destino
    const gamesDir = join(process.cwd(), "public", "games", themeId);
    await fs.mkdir(gamesDir, { recursive: true });

    let filesUploaded = 0;
    let gameUrl = "";

    // Verificar si es un archivo ZIP
    if (originalFileName.toLowerCase().endsWith(".zip")) {
      console.log("[Upload] 📦 Procesando archivo ZIP");

      // Extraer ZIP
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(gameFile.data);

      const extractPromises = [];
      zipContents.forEach((relativePath, file) => {
        if (!file.dir) {
          extractPromises.push(
            file.async("nodebuffer").then(async (content) => {
              const filePath = join(gamesDir, relativePath);
              const fileDir = dirname(filePath);

              // Crear directorio si no existe
              await fs.mkdir(fileDir, { recursive: true });

              // Escribir archivo
              await fs.writeFile(filePath, content);

              console.log(`[Upload] Extraído: ${relativePath}`);
              filesUploaded++;
            })
          );
        }
      });

      await Promise.all(extractPromises);

      // Buscar index.html para la URL del juego
      const indexPath = join(gamesDir, "index.html");
      try {
        await fs.access(indexPath);
        gameUrl = `/games/${themeId}/index.html`;
        console.log(`[Upload] ✅ Juego Unity WebGL detectado: ${gameUrl}`);
      } catch {
        // Si no hay index.html, usar la primera página HTML encontrada
        const files = await fs.readdir(gamesDir, { recursive: true });
        const htmlFile = files.find((file) =>
          file.toString().endsWith(".html")
        );
        if (htmlFile) {
          gameUrl = `/games/${themeId}/${htmlFile}`;
        } else {
          gameUrl = `/games/${themeId}/`;
        }
      }
    } else {
      // Archivo individual
      console.log("[Upload] 📄 Procesando archivo individual");

      const filePath = join(gamesDir, originalFileName);
      await fs.writeFile(filePath, gameFile.data);

      filesUploaded = 1;
      gameUrl = `/games/${themeId}/${originalFileName}`;
    }

    // Construir URL completa
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://192.95.7.30:8443" // HTTPS directo en producción
        : `http://localhost:${process.env.PORT || 3000}`;

    const fullGameUrl = `${baseUrl}${gameUrl}`;

    console.log(`[Upload] ✅ Upload completado: ${filesUploaded} archivos`);
    console.log(`[Upload] 🎮 URL del juego: ${fullGameUrl}`);

    return {
      success: true,
      gameUrl: fullGameUrl,
      filesUploaded,
      themeId,
      message: `Upload directo completado: ${filesUploaded} archivos procesados`,
    };
  } catch (error) {
    console.error("[Upload] ❌ Error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error interno del servidor",
    });
  }
});
