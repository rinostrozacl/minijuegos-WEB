import JSZip from "jszip";

interface ChunkUploadOptions {
  themeId: string;
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void;
}

interface UploadResult {
  success: boolean;
  themeId: string;
  gameUrl: string | null;
  filesUploaded: number;
  files: Array<{
    name: string;
    path: string;
    size: number;
  }>;
  message: string;
}

export const useChunkedUpload = () => {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const currentStep = ref("");
  const error = ref<string | null>(null);

  // Generar ID único para upload
  const generateUploadId = (): string => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Detectar si los archivos tienen estructura Unity WebGL
  const hasUnityStructure = (files: File[]): boolean => {
    const fileNames = files.map((f) => f.webkitRelativePath || f.name);
    const hasIndex = fileNames.some((name) =>
      name.toLowerCase().includes("index.html")
    );
    const hasBuild = fileNames.some((name) =>
      name.toLowerCase().includes("build/")
    );
    return hasIndex && hasBuild;
  };

  // Crear ZIP optimizado para Unity WebGL
  const createOptimizedUnityZip = async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    const zip = new JSZip();

    // Ordenar archivos: index.html primero, luego Build/, luego resto
    const sortedFiles = [...files].sort((a, b) => {
      const aName = a.webkitRelativePath || a.name;
      const bName = b.webkitRelativePath || b.name;

      if (aName.toLowerCase().includes("index.html")) return -1;
      if (bName.toLowerCase().includes("index.html")) return 1;
      if (aName.toLowerCase().includes("build/")) return -1;
      if (bName.toLowerCase().includes("build/")) return 1;
      return aName.localeCompare(bName);
    });

    // Agregar archivos al ZIP
    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const relativePath = file.webkitRelativePath || file.name;

      // Usar webkitRelativePath si está disponible (drag & drop de carpetas)
      const zipPath = relativePath.startsWith("./")
        ? relativePath.slice(2)
        : relativePath;

      zip.file(zipPath, file);

      if (onProgress) {
        const progress = ((i + 1) / sortedFiles.length) * 100;
        onProgress(progress);
      }
    }

    // Generar ZIP con compresión optimizada
    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }, // Balance entre tamaño y velocidad
    });
  };

  // Crear ZIP genérico para múltiples archivos
  const createZipFromFiles = async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    const zip = new JSZip();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.webkitRelativePath || file.name;
      zip.file(fileName, file);

      if (onProgress) {
        const progress = ((i + 1) / files.length) * 100;
        onProgress(progress);
      }
    }

    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
  };

  // Subir archivo por chunks
  const uploadFileInChunks = async (
    file: Blob,
    fileName: string,
    options: ChunkUploadOptions
  ): Promise<UploadResult> => {
    const {
      themeId,
      chunkSize = 5 * 1024 * 1024,
      onProgress,
      onChunkProgress,
    } = options;
    const uploadId = generateUploadId();
    const totalChunks = Math.ceil(file.size / chunkSize);

    console.log(
      `[ChunkedUpload] Iniciando upload: ${fileName} (${file.size} bytes, ${totalChunks} chunks)`
    );

    // Subir cada chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk, `chunk_${chunkIndex}`);
      formData.append("uploadId", uploadId);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("fileName", fileName);
      formData.append("themeId", themeId);

      // Debug: verificar que el FormData está bien formado
      console.log(`[ChunkedUpload] Enviando chunk ${chunkIndex + 1}:`, {
        uploadId,
        chunkIndex,
        totalChunks,
        fileName,
        themeId,
        chunkSize: chunk.size,
      });

      try {
        const response = await $fetch("/api/games/upload-chunk", {
          method: "POST",
          body: formData,
        });

        console.log(
          `[ChunkedUpload] Chunk ${chunkIndex + 1}/${totalChunks} subido`
        );

        // Actualizar progreso
        if (onProgress) {
          const progress = ((chunkIndex + 1) / totalChunks) * 100;
          onProgress(progress);
        }

        if (onChunkProgress) {
          onChunkProgress(chunkIndex + 1, totalChunks);
        }
      } catch (error: any) {
        console.error(
          `[ChunkedUpload] Error subiendo chunk ${chunkIndex}:`,
          error
        );
        throw new Error(
          `Error subiendo chunk ${chunkIndex + 1}: ${error.message}`
        );
      }
    }

    // Finalizar upload
    console.log(`[ChunkedUpload] Finalizando upload: ${uploadId}`);

    try {
      const result = await $fetch("/api/games/finalize-upload", {
        method: "POST",
        body: {
          uploadId,
          fileName,
          themeId,
        },
      });

      console.log(`[ChunkedUpload] Upload completado exitosamente`);
      return result as UploadResult;
    } catch (error: any) {
      console.error(`[ChunkedUpload] Error finalizando upload:`, error);
      throw new Error(`Error finalizando upload: ${error.message}`);
    }
  };

  // Función principal: Smart Upload (Opción 3)
  const smartUpload = async (
    files: File[],
    themeId: string
  ): Promise<UploadResult> => {
    try {
      isUploading.value = true;
      uploadProgress.value = 0;
      error.value = null;

      // Caso 1: Un solo archivo ZIP
      if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
        currentStep.value = "Subiendo archivo ZIP...";
        console.log("[SmartUpload] ZIP detectado - upload directo");

        return await uploadFileInChunks(files[0], files[0].name, {
          themeId,
          onProgress: (progress) => {
            uploadProgress.value = progress;
          },
          onChunkProgress: (current, total) => {
            currentStep.value = `Subiendo chunk ${current}/${total}...`;
          },
        });
      }

      // Caso 2: Múltiples archivos - detectar tipo y crear ZIP
      let zipBlob: Blob;
      let zipFileName: string;

      if (hasUnityStructure(files)) {
        currentStep.value = "Detectando juego Unity WebGL...";
        console.log(
          "[SmartUpload] Estructura Unity detectada - creando ZIP optimizado"
        );
        zipFileName = "unity-game.zip";

        currentStep.value = "Creando archivo optimizado...";
        zipBlob = await createOptimizedUnityZip(files, (progress) => {
          uploadProgress.value = progress * 0.2; // 20% del progreso total
          currentStep.value = `Creando archivo optimizado... ${Math.round(
            progress
          )}%`;
        });
      } else {
        currentStep.value = "Preparando archivos...";
        console.log("[SmartUpload] Archivos múltiples - creando ZIP general");
        zipFileName = "game-files.zip";

        zipBlob = await createZipFromFiles(files, (progress) => {
          uploadProgress.value = progress * 0.2; // 20% del progreso total
          currentStep.value = `Preparando archivos... ${Math.round(progress)}%`;
        });
      }

      // Subir ZIP creado
      currentStep.value = "Iniciando subida...";
      const result = await uploadFileInChunks(zipBlob, zipFileName, {
        themeId,
        onProgress: (progress) => {
          uploadProgress.value = 20 + progress * 0.8; // 80% restante del progreso
        },
        onChunkProgress: (current, total) => {
          currentStep.value = `Subiendo chunk ${current}/${total}...`;
        },
      });

      currentStep.value = "Upload completado";
      uploadProgress.value = 100;

      return result;
    } catch (err: any) {
      console.error("[SmartUpload] Error:", err);
      error.value = err.message || "Error desconocido durante la subida";
      throw err;
    } finally {
      isUploading.value = false;
    }
  };

  return {
    // Estado reactivo
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    currentStep: readonly(currentStep),
    error: readonly(error),

    // Funciones principales
    smartUpload,
    uploadFileInChunks,

    // Utilidades
    hasUnityStructure,
    createOptimizedUnityZip,
    createZipFromFiles,
    generateUploadId,
  };
};
