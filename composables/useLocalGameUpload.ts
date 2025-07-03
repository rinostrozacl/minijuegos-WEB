export const useLocalGameUpload = () => {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);

  /**
   * Sube archivos de juego Unity WebGL al almacenamiento local
   */
  const uploadGameFiles = async (
    themeId: string,
    files: File[] | FileList
  ): Promise<{
    success: boolean;
    gameUrl?: string;
    filesUploaded?: number;
    message?: string;
  }> => {
    if (!themeId) {
      throw new Error("Theme ID es requerido");
    }

    if (!files || files.length === 0) {
      throw new Error("No se han seleccionado archivos");
    }

    isUploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
      console.log(`[LocalUpload] Iniciando subida para tema: ${themeId}`);
      console.log(`[LocalUpload] Archivos a subir: ${files.length}`);

      // Crear FormData
      const formData = new FormData();
      formData.append("themeId", themeId);

      // Agregar archivos
      Array.from(files).forEach((file, index) => {
        formData.append(`files`, file);
        console.log(
          `[LocalUpload] Archivo ${index + 1}: ${file.name} (${
            file.size
          } bytes)`
        );
      });

      // Realizar la subida
      const response = await $fetch("/api/games/upload", {
        method: "POST",
        body: formData,
        onUploadProgress: (progress: any) => {
          uploadProgress.value = Math.round(
            (progress.loaded / progress.total) * 100
          );
          console.log(`[LocalUpload] Progreso: ${uploadProgress.value}%`);
        },
      });

      console.log("[LocalUpload] Respuesta del servidor:", response);

      if (response.success) {
        console.log(`[LocalUpload] ✅ Subida exitosa:`);
        console.log(`  - Archivos subidos: ${response.filesUploaded}`);
        console.log(`  - URL del juego: ${response.gameUrl}`);

        return {
          success: true,
          gameUrl: response.gameUrl || undefined,
          filesUploaded: response.filesUploaded,
          message: response.message,
        };
      } else {
        throw new Error("La subida falló en el servidor");
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Error desconocido al subir el juego";
      console.error("[LocalUpload] Error:", errorMessage);
      error.value = errorMessage;

      throw new Error(errorMessage);
    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Sube un archivo ZIP que contiene el juego Unity WebGL
   */
  const uploadGameZip = async (
    themeId: string,
    zipFile: File
  ): Promise<{
    success: boolean;
    gameUrl?: string;
    filesUploaded?: number;
    message?: string;
  }> => {
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      throw new Error("El archivo debe ser un ZIP");
    }

    console.log(
      `[LocalUpload] Subiendo ZIP: ${zipFile.name} (${zipFile.size} bytes)`
    );

    return await uploadGameFiles(themeId, [zipFile]);
  };

  /**
   * Valida que los archivos sean apropiados para Unity WebGL
   */
  const validateUnityFiles = (
    files: File[] | FileList
  ): {
    isValid: boolean;
    hasIndex: boolean;
    hasBuildFolder: boolean;
    warnings: string[];
  } => {
    const fileArray = Array.from(files);
    const fileNames = fileArray.map((f) => f.name.toLowerCase());
    const filePaths = fileArray
      .map((f) => {
        // @ts-ignore - webkitRelativePath existe en algunos navegadores
        return f.webkitRelativePath || f.name;
      })
      .map((path) => path.toLowerCase());

    const hasIndex =
      fileNames.includes("index.html") ||
      filePaths.some((path) => path.includes("index.html"));

    const hasBuildFolder =
      filePaths.some((path) => path.includes("build/")) ||
      filePaths.some((path) => path.includes("/build/"));

    const hasUnityFiles = filePaths.some(
      (path) =>
        path.includes(".wasm") ||
        path.includes(".data") ||
        path.includes("web.loader.js")
    );

    const warnings = [];

    if (!hasIndex) {
      warnings.push("No se encontró archivo index.html");
    }

    if (!hasBuildFolder && !hasUnityFiles) {
      warnings.push("No se detectaron archivos típicos de Unity WebGL");
    }

    if (fileArray.length === 0) {
      warnings.push("No se han seleccionado archivos");
    }

    const isValid = hasIndex && (hasBuildFolder || hasUnityFiles);

    return {
      isValid,
      hasIndex,
      hasBuildFolder: hasBuildFolder || hasUnityFiles,
      warnings,
    };
  };

  /**
   * Elimina un juego del almacenamiento local
   */
  const deleteGame = async (
    themeId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!themeId) {
      throw new Error("Theme ID es requerido");
    }

    try {
      console.log(`[LocalUpload] Eliminando juego para tema: ${themeId}`);

      const response = await $fetch("/api/games/delete", {
        method: "POST",
        body: { themeId },
      });

      console.log("[LocalUpload] Juego eliminado:", response);

      return {
        success: true,
        message: response.message,
      };
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Error desconocido al eliminar el juego";
      console.error("[LocalUpload] Error eliminando:", errorMessage);
      error.value = errorMessage;

      throw new Error(errorMessage);
    }
  };

  /**
   * Reset del estado
   */
  const reset = () => {
    isUploading.value = false;
    uploadProgress.value = 0;
    error.value = null;
  };

  return {
    // Estado
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    error: readonly(error),

    // Métodos
    uploadGameFiles,
    uploadGameZip,
    validateUnityFiles,
    deleteGame,
    reset,
  };
};
