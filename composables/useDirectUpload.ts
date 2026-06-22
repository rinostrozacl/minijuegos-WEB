import {
  MAX_GAME_UPLOAD_BYTES,
  MAX_GAME_UPLOAD_LABEL,
  ZIP_ROOT_INDEX_MESSAGE,
  isZipFileName,
  isWithinUploadSizeLimit,
  formatBytes,
} from "~/utils/gameUpload";

interface UploadResult {
  success: boolean;
  gameUrl?: string;
  filesUploaded?: number;
  themeId?: string;
  message?: string;
}

export function validateGameZipFile(file: File): string | null {
  if (!isZipFileName(file.name)) {
    return "Solo se permiten archivos .zip";
  }
  if (!isWithinUploadSizeLimit(file.size)) {
    return `El ZIP supera el límite de ${MAX_GAME_UPLOAD_LABEL} (tamaño: ${formatBytes(file.size)})`;
  }
  return null;
}

export const useDirectUpload = () => {
  const isDirectUploading = ref(false);
  const directUploadProgress = ref(0);
  const directUploadStep = ref("");
  const error = ref<string | null>(null);

  const uploadGameZip = async (
    file: File,
    themeId: string,
    idToken: string
  ): Promise<UploadResult> => {
    const validationError = validateGameZipFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    if (!idToken?.trim()) {
      throw new Error("Sesión requerida para subir el build");
    }

    isDirectUploading.value = true;
    directUploadProgress.value = 0;
    directUploadStep.value = "Subiendo ZIP...";
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("gameFile", file, file.name);
      formData.append("themeId", themeId);

      const result = await $fetch<{
        success: boolean;
        gameUrl: string;
        filesUploaded: number;
        message?: string;
      }>("/api/games/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      directUploadProgress.value = 100;
      directUploadStep.value = "Subida completada";

      return {
        success: true,
        gameUrl: result.gameUrl,
        filesUploaded: result.filesUploaded,
        themeId,
        message: result.message || "Build subido correctamente",
      };
    } catch (err: unknown) {
      const e = err as {
        data?: { statusMessage?: string };
        statusMessage?: string;
        message?: string;
      };
      const msg =
        e?.data?.statusMessage ||
        e?.statusMessage ||
        e?.message ||
        "Error al subir el ZIP";
      error.value = msg;
      throw new Error(msg);
    } finally {
      isDirectUploading.value = false;
    }
  };

  return {
    isDirectUploading: readonly(isDirectUploading),
    directUploadProgress: readonly(directUploadProgress),
    directUploadStep: readonly(directUploadStep),
    error: readonly(error),
    uploadGameZip,
    validateGameZipFile,
    MAX_GAME_UPLOAD_BYTES,
    MAX_GAME_UPLOAD_LABEL,
    ZIP_ROOT_INDEX_MESSAGE,
  };
};
