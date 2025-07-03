import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";

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
    const { uploadId, fileName, themeId } = body;

    if (!uploadId || !fileName || !themeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Parámetros requeridos: uploadId, fileName, themeId",
      });
    }

    console.log(`[FinalizeUpload] Finalizando upload: ${fileName} para tema ${themeId}`);

    // Directorio temporal de chunks
    const tempDir = path.join(process.cwd(), "temp", "chunks", uploadId);
    
    // Verificar que existe el directorio
    try {
      await fs.access(tempDir);
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Upload ID no encontrado o chunks faltantes",
      });
    }

    // Leer todos los chunks
    const chunkFiles = await fs.readdir(tempDir);
    const sortedChunks = chunkFiles
      .filter(file => file.startsWith('chunk_'))
      .sort((a, b) => {
        const indexA = parseInt(a.replace('chunk_', ''));
        const indexB = parseInt(b.replace('chunk_', ''));
        return indexA - indexB;
      });

    if (sortedChunks.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No se encontraron chunks para ensamblar",
      });
    }

    console.log(`[FinalizeUpload] Ensamblando ${sortedChunks.length} chunks`);

    // Ensamblar archivo completo
    const assembledChunks = [];
    for (const chunkFile of sortedChunks) {
      const chunkPath = path.join(tempDir, chunkFile);
      const chunkBuffer = await fs.readFile(chunkPath);
      assembledChunks.push(chunkBuffer);
    }

    // Concatenar todos los chunks
    const completeFile = Buffer.concat(assembledChunks);
    console.log(`[FinalizeUpload] Archivo ensamblado: ${completeFile.length} bytes`);

    // Crear directorio del juego
    const gamesDir = path.join(process.cwd(), "public", "games");
    const gameDir = path.join(gamesDir, themeId);
    await fs.mkdir(gameDir, { recursive: true });

    let uploadedFiles = [];
    let gameUrl = null;

    // Procesar como ZIP si termina en .zip
    if (fileName.toLowerCase().endsWith('.zip')) {
      console.log(`[FinalizeUpload] Procesando como archivo ZIP: ${fileName}`);
      
      try {
        const zip = new AdmZip(completeFile);
        const zipEntries = zip.getEntries();

        for (const zipEntry of zipEntries) {
          if (zipEntry.isDirectory) continue;

          // Crear la estructura de carpetas
          const entryPath = zipEntry.entryName;
          const fullPath = path.join(gameDir, entryPath);
          const dirPath = path.dirname(fullPath);

          // Asegurar que existe el directorio
          await fs.mkdir(dirPath, { recursive: true });

          // Escribir el archivo
          await fs.writeFile(fullPath, zipEntry.getData());

          uploadedFiles.push({
            name: path.basename(entryPath),
            path: entryPath,
            size: zipEntry.header.size,
          });

          // Si es index.html, establecer como URL del juego
          if (path.basename(entryPath).toLowerCase() === 'index.html') {
            gameUrl = `/games/${themeId}/${entryPath}`;
          }
        }

        console.log(`[FinalizeUpload] ZIP descomprimido: ${zipEntries.length} archivos`);
      } catch (error) {
        console.error(`[FinalizeUpload] Error descomprimiendo ZIP:`, error);
        throw createError({
          statusCode: 400,
          statusMessage: "Error al descomprimir el archivo ZIP",
        });
      }
    } else {
      // Archivo individual
      const filePath = path.join(gameDir, fileName);
      const dirPath = path.dirname(filePath);

      // Asegurar que existe el directorio
      await fs.mkdir(dirPath, { recursive: true });

      // Escribir el archivo
      await fs.writeFile(filePath, completeFile);

      uploadedFiles.push({
        name: fileName,
        path: fileName,
        size: completeFile.length,
      });

      // Si es index.html, establecer como URL del juego
      if (fileName.toLowerCase() === 'index.html') {
        gameUrl = `/games/${themeId}/${fileName}`;
      }
    }

    // Si no encontramos index.html, buscar en los archivos subidos
    if (!gameUrl && uploadedFiles.length > 0) {
      const indexFile = uploadedFiles.find(
        (f) => f.name.toLowerCase() === 'index.html'
      );
      if (indexFile) {
        gameUrl = `/games/${themeId}/${indexFile.path}`;
      } else {
        // Usar el primer archivo HTML que encontremos
        const htmlFile = uploadedFiles.find((f) =>
          f.name.toLowerCase().endsWith('.html')
        );
        if (htmlFile) {
          gameUrl = `/games/${themeId}/${htmlFile.path}`;
        }
      }
    }

    // Limpiar chunks temporales
    try {
      for (const chunkFile of sortedChunks) {
        const chunkPath = path.join(tempDir, chunkFile);
        await fs.unlink(chunkPath);
      }
      await fs.rmdir(tempDir);
      
      // Intentar limpiar directorio padre si está vacío
      const parentDir = path.dirname(tempDir);
      try {
        await fs.rmdir(parentDir);
      } catch (error) {
        // Ignorar si no está vacío
      }
    } catch (error) {
      console.warn(`[FinalizeUpload] Error limpiando chunks temporales:`, error);
    }

    console.log(`[FinalizeUpload] Upload finalizado exitosamente:`);
    console.log(`  - Archivos procesados: ${uploadedFiles.length}`);
    console.log(`  - URL del juego: ${gameUrl}`);
    console.log(`  - Carpeta: ${gameDir}`);

    return {
      success: true,
      themeId,
      gameUrl,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles,
      message: `Juego subido exitosamente. ${uploadedFiles.length} archivos procesados.`,
    };

  } catch (error) {
    console.error("[FinalizeUpload] Error finalizando upload:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error interno del servidor",
    });
  }
});
