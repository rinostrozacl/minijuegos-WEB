import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import formidable from "formidable";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";

/**
 * Endpoint especial para uploads directos grandes
 * Maneja archivos de hasta 500MB sin pasar por proxy
 */
export default defineEventHandler(async (event) => {
  console.log("[DirectUpload] Iniciando upload directo...");

  try {
    // Configurar headers para CORS si es necesario
    setHeader(event, "Access-Control-Allow-Origin", "*");
    setHeader(event, "Access-Control-Allow-Methods", "POST, OPTIONS");
    setHeader(event, "Access-Control-Allow-Headers", "Content-Type");

    if (getMethod(event) === "OPTIONS") {
      return { status: "OK" };
    }

    // Configurar formidable para archivos grandes
    const form = formidable({
      maxFileSize: 500 * 1024 * 1024, // 500MB
      maxTotalFileSize: 500 * 1024 * 1024, // 500MB total
      allowEmptyFiles: false,
      multiples: false, // Solo un archivo ZIP
    });

    // Parsear el formulario
    const [fields, files] = await form.parse(event.node.req);

    console.log("[DirectUpload] Archivo recibido:", {
      fieldsKeys: Object.keys(fields),
      filesKeys: Object.keys(files),
    });

    // Extraer parámetros
    const themeId = Array.isArray(fields.themeId)
      ? fields.themeId[0]
      : fields.themeId;

    if (!themeId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Theme ID es requerido",
      });
    }

    // Obtener el archivo
    const fileArray = files.gameFile;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: "No se encontró archivo de juego",
      });
    }

    console.log("[DirectUpload] Procesando archivo:", {
      originalFilename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Leer el archivo
    const fileBuffer = fs.readFileSync(file.filepath);

    // Si es un ZIP, procesar directamente
    let processedFiles: any[] = [];

    if (file.originalFilename?.endsWith(".zip")) {
      console.log("[DirectUpload] Descomprimiendo ZIP...");
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        if (!entry.isDirectory) {
          processedFiles.push({
            name: entry.entryName,
            data: entry.getData(),
            size: entry.header.size,
          });
        }
      }
    } else {
      // Archivo individual
      processedFiles.push({
        name: file.originalFilename || "game-file",
        data: fileBuffer,
        size: file.size,
      });
    }

    console.log(`[DirectUpload] Procesados ${processedFiles.length} archivos`);

    // Subir archivos a Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket("minijuegos-1012b.firebasestorage.app");

    const uploadPromises = processedFiles.map(async (fileData) => {
      const fileName = `games/${themeId}/${fileData.name}`;
      const fileRef = bucket.file(fileName);

      await fileRef.save(fileData.data, {
        metadata: {
          contentType: getContentType(fileData.name),
        },
      });

      // Hacer el archivo público
      await fileRef.makePublic();

      return {
        name: fileData.name,
        url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    // Buscar index.html para determinar la URL del juego
    const indexFile = uploadedFiles.find(
      (f) =>
        f.name.toLowerCase() === "index.html" ||
        f.name.toLowerCase().endsWith("/index.html")
    );

    const gameUrl = indexFile ? indexFile.url : uploadedFiles[0]?.url;

    console.log(
      `[DirectUpload] Upload exitoso: ${uploadedFiles.length} archivos subidos`
    );

    return {
      success: true,
      gameUrl,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles.map((f) => ({ name: f.name, url: f.url })),
    };
  } catch (error: any) {
    console.error("[DirectUpload] Error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: `Error en upload directo: ${error.message}`,
    });
  }
});

/**
 * Determinar content-type basado en la extensión del archivo
 */
function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".wasm": "application/wasm",
    ".br": "application/x-brotli",
    ".gz": "application/gzip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
  };

  // Para archivos Brotli, determinar el tipo base
  if (fileName.endsWith(".js.br")) return "application/javascript";
  if (fileName.endsWith(".wasm.br")) return "application/wasm";
  if (fileName.endsWith(".data.br")) return "application/octet-stream";

  return mimeTypes[ext] || "application/octet-stream";
}
