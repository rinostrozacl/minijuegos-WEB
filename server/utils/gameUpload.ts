import { promises as fs } from "fs";
import { join, dirname, normalize } from "path";
import JSZip from "jszip";
import {
  MAX_GAME_UPLOAD_BYTES,
  MAX_GAME_UPLOAD_FILES,
  ZIP_ROOT_INDEX_MESSAGE,
  formatBytes,
  isZipFileName,
} from "~/utils/gameUpload";

export function getGameDir(themeId: string): string {
  return join(process.cwd(), "public", "games", themeId);
}

export function buildGamePlayPath(themeId: string): string {
  return `/games/${themeId}/index.html`;
}

/** Elimina recursivamente el directorio del juego si existe. */
export async function clearGameDir(themeId: string): Promise<void> {
  const gameDir = getGameDir(themeId);
  const exists = await fs
    .access(gameDir)
    .then(() => true)
    .catch(() => false);

  if (!exists) return;

  await fs.rm(gameDir, { recursive: true, force: true });
}

function isSafeZipEntryPath(relativePath: string): boolean {
  const normalized = normalize(relativePath).replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("..") || normalized.includes("/../")) {
    return false;
  }
  return true;
}

export interface ExtractZipResult {
  filesUploaded: number;
  totalBytes: number;
  gameUrl: string;
}

/**
 * Extrae un ZIP WebGL en public/games/{themeId}.
 * Exige index.html en la raíz del ZIP (sin carpeta contenedora).
 */
export async function extractZipToGameDir(
  themeId: string,
  zipBuffer: Buffer
): Promise<ExtractZipResult> {
  await clearGameDir(themeId);

  const gamesDir = getGameDir(themeId);
  await fs.mkdir(gamesDir, { recursive: true });

  const zip = await JSZip.loadAsync(zipBuffer);
  const entries = Object.entries(zip.files).filter(([, file]) => !file.dir);

  if (entries.length === 0) {
    await clearGameDir(themeId);
    throw createError({
      statusCode: 400,
      statusMessage: "El ZIP está vacío",
    });
  }

  if (entries.length > MAX_GAME_UPLOAD_FILES) {
    await clearGameDir(themeId);
    throw createError({
      statusCode: 400,
      statusMessage: `El ZIP contiene demasiados archivos (máximo ${MAX_GAME_UPLOAD_FILES})`,
    });
  }

  const rootIndexOnly = entries.some(
    ([path]) => path.replace(/\\/g, "/") === "index.html"
  );

  if (!rootIndexOnly) {
    await clearGameDir(themeId);
    throw createError({
      statusCode: 400,
      statusMessage: ZIP_ROOT_INDEX_MESSAGE,
    });
  }

  let totalBytes = 0;
  let filesUploaded = 0;

  for (const [relativePath, file] of entries) {
    if (!isSafeZipEntryPath(relativePath)) {
      await clearGameDir(themeId);
      throw createError({
        statusCode: 400,
        statusMessage: "Entrada inválida en el ZIP",
      });
    }

    const content = await file.async("nodebuffer");
    totalBytes += content.length;

    if (totalBytes > MAX_GAME_UPLOAD_BYTES) {
      await clearGameDir(themeId);
      throw createError({
        statusCode: 413,
        statusMessage: `El contenido descomprimido supera ${formatBytes(MAX_GAME_UPLOAD_BYTES)}`,
      });
    }

    const filePath = join(gamesDir, relativePath);
    const fileDir = dirname(filePath);
    await fs.mkdir(fileDir, { recursive: true });
    await fs.writeFile(filePath, content);
    filesUploaded++;
  }

  const indexPath = join(gamesDir, "index.html");
  try {
    await fs.access(indexPath);
  } catch {
    await clearGameDir(themeId);
    throw createError({
      statusCode: 400,
      statusMessage: ZIP_ROOT_INDEX_MESSAGE,
    });
  }

  return {
    filesUploaded,
    totalBytes,
    gameUrl: buildGamePlayPath(themeId),
  };
}

export function assertZipUploadFile(
  fileName: string,
  fileSize: number
): void {
  if (!isZipFileName(fileName)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Solo se permiten archivos .zip",
    });
  }

  if (fileSize > MAX_GAME_UPLOAD_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `El archivo supera el límite de ${formatBytes(MAX_GAME_UPLOAD_BYTES)}`,
    });
  }

  if (fileSize === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "El archivo ZIP está vacío",
    });
  }
}
