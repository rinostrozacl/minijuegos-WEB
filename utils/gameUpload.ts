/** Límite de tamaño para ZIP de build WebGL (comprimido y descomprimido). */
export const MAX_GAME_UPLOAD_BYTES = 5 * 1024 * 1024;

export const MAX_GAME_UPLOAD_LABEL = "5 MB";

export const MAX_GAME_UPLOAD_FILES = 500;

export const ZIP_ROOT_INDEX_MESSAGE =
  "El ZIP debe tener index.html en la raíz (comprime el contenido de la carpeta del build, no la carpeta entera).";

export function isZipFileName(name: string): boolean {
  return name.trim().toLowerCase().endsWith(".zip");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isWithinUploadSizeLimit(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_GAME_UPLOAD_BYTES;
}

/**
 * Normaliza gameWebGLUrl almacenado en Firestore para reproducir en iframe same-origin.
 */
export function resolveGamePlayUrl(
  stored: string | null | undefined
): string | null {
  if (!stored || !String(stored).trim()) return null;

  const value = String(stored).trim();

  if (value.startsWith("/games/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.pathname.startsWith("/games/")) {
      return url.pathname;
    }
  } catch {
    // No es URL absoluta
  }

  return null;
}
