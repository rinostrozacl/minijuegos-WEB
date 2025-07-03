import JSZip from "jszip";

interface DirectUploadOptions {
  themeId: string;
  onProgress?: (progress: number) => void;
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

export const useDirectUpload = () => {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const currentStep = ref("");
  const error = ref<string | null>(null);

  // URL directa del servidor sin proxy
  const DIRECT_SERVER_URL = "http://192.95.7.30:8081";

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

    // Ordenar archivos: index.html primero, luego Build/, después el resto
    const sortedFiles = [...files].sort((a, b) => {
      const aName = a.webkitRelativePath || a.name;
      const bName = b.webkitRelativePath || b.name;

      if (aName.toLowerCase().includes("index.html")) return -1;
      if (bName.toLowerCase().includes("index.html")) return 1;
      if (aName.toLowerCase().includes("build/")) return -1;
      if (bName.toLowerCase().includes("build/")) return 1;
      return aName.localeCompare(bName);
    });

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

  // Subir archivo directamente al servidor
  const uploadFileDirect = async (
    file: Blob,
    fileName: string,
    options: DirectUploadOptions
  ): Promise<UploadResult> => {
    const { themeId, onProgress } = options;

    console.log(`[DirectUpload] Subiendo ${fileName} (${file.size} bytes) directamente al servidor`);

    const formData = new FormData();
    formData.append("gameFile", file, fileName);
    formData.append("themeId", themeId);

    try {
      const response = await fetch(`${DIRECT_SERVER_URL}/api/games/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`[DirectUpload] Upload completado exitosamente`);
      return result as UploadResult;
    } catch (error: any) {
      console.error(`[DirectUpload] Error subiendo archivo:`, error);
      throw new Error(`Error subiendo archivo: ${error.message}`);
    }
  };

  // Función principal: Smart Upload Directo
  const smartUploadDirect = async (
    files: File[],
    themeId: string
  ): Promise<UploadResult> => {
    try {
      isUploading.value = true;
      uploadProgress.value = 0;
      error.value = null;

      console.log(`[DirectUpload] Iniciando upload directo a ${DIRECT_SERVER_URL}`);

      // Caso 1: Un solo archivo ZIP
      if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
        currentStep.value = "Subiendo archivo ZIP directamente...";
        console.log("[DirectUpload] ZIP detectado - upload directo", {
          fileName: files[0].name,
          fileSize: files[0].size,
          fileType: files[0].type,
        });

        return await uploadFileDirect(files[0], files[0].name, {
          themeId,
          onProgress: (progress) => {
            uploadProgress.value = progress;
          },
        });
      }

      // Caso 2: Múltiples archivos - detectar tipo y crear ZIP
      let zipBlob: Blob;
      let zipFileName: string;

      if (hasUnityStructure(files)) {
        currentStep.value = "Detectando juego Unity WebGL...";
        console.log("[DirectUpload] Estructura Unity detectada - creando ZIP optimizado");
        zipFileName = "unity-game.zip";

        currentStep.value = "Creando archivo optimizado...";
        zipBlob = await createOptimizedUnityZip(files, (progress) => {
          uploadProgress.value = progress * 0.3; // 30% del progreso total
          currentStep.value = `Creando archivo optimizado... ${Math.round(progress)}%`;
        });
      } else {
        currentStep.value = "Preparando archivos...";
        console.log("[DirectUpload] Archivos múltiples - creando ZIP general");
        zipFileName = "game-files.zip";

        zipBlob = await createZipFromFiles(files, (progress) => {
          uploadProgress.value = progress * 0.3; // 30% del progreso total
          currentStep.value = `Preparando archivos... ${Math.round(progress)}%`;
        });
      }

      // Subir ZIP creado directamente
      currentStep.value = "Subiendo al servidor...";
      console.log("[DirectUpload] Subiendo ZIP creado directamente", {
        zipFileName,
        zipSize: zipBlob.size,
        zipType: zipBlob.type,
        targetServer: DIRECT_SERVER_URL,
      });

      uploadProgress.value = 30; // ZIP creado, empezar upload
      currentStep.value = "Transfiriendo archivo al servidor...";

      const result = await uploadFileDirect(zipBlob, zipFileName, {
        themeId,
        onProgress: (progress) => {
          uploadProgress.value = 30 + progress * 0.7; // 70% restante del progreso
        },
      });

      currentStep.value = "Upload completado exitosamente";
      uploadProgress.value = 100;

      return result;
    } catch (err: any) {
      console.error("[DirectUpload] Error:", err);
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
    smartUploadDirect,
    uploadFileDirect,

    // Utilidades
    hasUnityStructure,
    createOptimizedUnityZip,
    createZipFromFiles,
  };
};
