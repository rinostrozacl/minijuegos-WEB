import { promises as fs } from "fs";
import path from "path";
import formidable from "formidable";

export default defineEventHandler(async (event) => {
  try {
    // Verificar que sea POST
    if (getMethod(event) !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed",
      });
    }

    // Parsear el formulario con chunks más pequeños
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB máximo por chunk
      allowEmptyFiles: false,
      multiples: false,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(event.node.req);

    // Extraer parámetros del chunk con validación
    const uploadId = Array.isArray(fields.uploadId) ? fields.uploadId[0] : fields.uploadId;
    const chunkIndexStr = Array.isArray(fields.chunkIndex) ? fields.chunkIndex[0] : fields.chunkIndex;
    const totalChunksStr = Array.isArray(fields.totalChunks) ? fields.totalChunks[0] : fields.totalChunks;
    const fileName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;
    const themeId = Array.isArray(fields.themeId) ? fields.themeId[0] : fields.themeId;

    // Validar que tenemos todos los parámetros
    if (!uploadId || !chunkIndexStr || !totalChunksStr || !fileName || !themeId) {
      console.error("[ChunkUpload] Parámetros faltantes:", { uploadId, chunkIndexStr, totalChunksStr, fileName, themeId });
      throw createError({
        statusCode: 400,
        statusMessage: "Parámetros de chunk faltantes",
      });
    }

    const chunkIndex = parseInt(chunkIndexStr);
    const totalChunks = parseInt(totalChunksStr);

    if (isNaN(chunkIndex) || isNaN(totalChunks)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Índices de chunk inválidos",
      });
    }

    console.log(`[ChunkUpload] Procesando chunk ${chunkIndex + 1}/${totalChunks} para ${fileName}`);

    // Obtener el archivo del chunk
    const chunkFile = files.chunk;
    if (!chunkFile || Array.isArray(chunkFile)) {
      console.error("[ChunkUpload] Chunk no encontrado. Files recibidos:", Object.keys(files));
      console.error("[ChunkUpload] Fields recibidos:", Object.keys(fields));
      throw createError({
        statusCode: 400,
        statusMessage: "Chunk de archivo no encontrado",
      });
    }

    // Validar que el archivo tiene filepath
    if (!chunkFile.filepath) {
      console.error("[ChunkUpload] Archivo sin filepath válido:", chunkFile);
      throw createError({
        statusCode: 400,
        statusMessage: "Archivo temporal inválido",
      });
    }

    // Crear directorio temporal para chunks
    const tempDir = path.join(process.cwd(), "temp", "chunks", uploadId);
    await fs.mkdir(tempDir, { recursive: true });

    // Guardar chunk
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex.toString().padStart(4, "0")}`);
    
    try {
      const chunkBuffer = await fs.readFile(chunkFile.filepath);
      await fs.writeFile(chunkPath, chunkBuffer);
      console.log(`[ChunkUpload] Chunk guardado en: ${chunkPath} (${chunkBuffer.length} bytes)`);
    } catch (readError) {
      console.error("[ChunkUpload] Error leyendo archivo temporal:", readError);
      throw createError({
        statusCode: 500,
        statusMessage: "Error procesando chunk",
      });
    }

    // Limpiar archivo temporal de formidable
    try {
      await fs.unlink(chunkFile.filepath);
    } catch (cleanupError) {
      console.warn(`[ChunkUpload] No se pudo eliminar archivo temporal: ${chunkFile.filepath}`, cleanupError);
    }

    // Verificar si todos los chunks han llegado
    const existingChunks = await fs.readdir(tempDir);
    const receivedChunks = existingChunks.filter((file) => file.startsWith("chunk_")).length;

    console.log(`[ChunkUpload] Chunk ${chunkIndex + 1}/${totalChunks} guardado. Total recibidos: ${receivedChunks}`);

    return {
      success: true,
      uploadId,
      chunkIndex,
      totalChunks,
      receivedChunks,
      isComplete: receivedChunks === totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} procesado exitosamente`,
    };

  } catch (error: any) {
    console.error("[ChunkUpload] Error procesando chunk:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error interno del servidor",
    });
  }
});
