import { promises as fs } from "fs";
import path from "path";
import formidable from "formidable";
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

    // Parsear el formulario con archivos
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB máximo
      maxTotalFileSize: 200 * 1024 * 1024, // 200MB total
      allowEmptyFiles: false,
      multiples: true,
    });

    const [fields, files] = await form.parse(event.node.req);

    // Obtener el ID del tema
    const themeId = Array.isArray(fields.themeId)
      ? fields.themeId[0]
      : fields.themeId;
    if (!themeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Theme ID is required",
      });
    }

    console.log(`[Upload] Procesando subida para tema: ${themeId}`);

    // Crear la carpeta del juego
    const gamesDir = path.join(process.cwd(), "public", "games");
    const gameDir = path.join(gamesDir, themeId);

    // Asegurar que existe la carpeta
    await fs.mkdir(gameDir, { recursive: true });

    let uploadedFiles = [];
    let gameUrl = null;

    // Procesar archivos
    const fileEntries = Object.entries(files);

    for (const [fieldName, fileArray] of fileEntries) {
      const fileList = Array.isArray(fileArray) ? fileArray : [fileArray];

      for (const file of fileList) {
        if (!file || !file.filepath) continue;

        console.log(`[Upload] Procesando archivo: ${file.originalFilename}`);

        // Leer el archivo
        const fileBuffer = await fs.readFile(file.filepath);

        // Si es un ZIP, descomprimirlo
        if (file.originalFilename?.toLowerCase().endsWith(".zip")) {
          console.log(
            `[Upload] Descomprimiendo archivo ZIP: ${file.originalFilename}`
          );

          try {
            const zip = new AdmZip(fileBuffer);
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
              if (path.basename(entryPath).toLowerCase() === "index.html") {
                gameUrl = `/games/${themeId}/${entryPath}`;
              }
            }

            console.log(
              `[Upload] ZIP descomprimido exitosamente: ${zipEntries.length} archivos`
            );
          } catch (error) {
            console.error(`[Upload] Error descomprimiendo ZIP:`, error);
            throw createError({
              statusCode: 400,
              statusMessage: "Error al descomprimir el archivo ZIP",
            });
          }
        } else {
          // Archivo individual
          const relativePath = file.originalFilename || `file_${Date.now()}`;
          const filePath = path.join(gameDir, relativePath);
          const dirPath = path.dirname(filePath);

          // Asegurar que existe el directorio
          await fs.mkdir(dirPath, { recursive: true });

          // Escribir el archivo
          await fs.writeFile(filePath, fileBuffer);

          uploadedFiles.push({
            name: file.originalFilename,
            path: relativePath,
            size: file.size,
          });

          // Si es index.html, establecer como URL del juego
          if (file.originalFilename?.toLowerCase() === "index.html") {
            gameUrl = `/games/${themeId}/${relativePath}`;
          }
        }

        // Limpiar archivo temporal
        try {
          await fs.unlink(file.filepath);
        } catch (error) {
          console.warn(
            `[Upload] No se pudo eliminar archivo temporal: ${file.filepath}`
          );
        }
      }
    }

    // Si no encontramos index.html, buscar en los archivos subidos
    if (!gameUrl && uploadedFiles.length > 0) {
      const indexFile = uploadedFiles.find(
        (f) => f.name.toLowerCase() === "index.html"
      );
      if (indexFile) {
        gameUrl = `/games/${themeId}/${indexFile.path}`;
      } else {
        // Usar el primer archivo HTML que encontremos
        const htmlFile = uploadedFiles.find((f) =>
          f.name.toLowerCase().endsWith(".html")
        );
        if (htmlFile) {
          gameUrl = `/games/${themeId}/${htmlFile.path}`;
        }
      }
    }

    console.log(`[Upload] Subida completada:`);
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
    console.error("[Upload] Error procesando subida:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error interno del servidor",
    });
  }
});
