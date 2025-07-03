import JSZip from "jszip";

// Tipos simplificados para upload directo únicamente
interface UploadOptions {
  themeId: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  success: boolean;
  gameUrl?: string;
  filesUploaded?: number;
  themeId?: string;
  files?: Array<{ name: string; url: string }>;
  message?: string;
}

export const useDirectUpload = () => {
  const isDirectUploading = ref(false);
  const directUploadProgress = ref(0);
  const directUploadStep = ref("");
  const error = ref<string | null>(null);

  // 🎯 SOLO HTTPS DIRECTO - Sin Cloudflare, sin Firebase, sin chunks
  const DIRECT_HTTPS_URL = "https://192.95.7.30:8443";

  // Función para detectar estructura Unity WebGL
  const hasUnityStructure = (files: FileList): boolean => {
    const fileArray = Array.from(files);
    const hasIndexHtml = fileArray.some(
      (file) => file.name.toLowerCase() === "index.html"
    );
    const hasBuildFolder = fileArray.some((file) =>
      file.webkitRelativePath.toLowerCase().includes("build/")
    );
    return hasIndexHtml && hasBuildFolder;
  };

  // Función para crear ZIP optimizado para Unity WebGL
  const createOptimizedUnityZip = async (
    files: FileList,
    onProgress?: (progress: number) => void
  ): Promise<File> => {
    const zip = new JSZip();
    const fileArray = Array.from(files);

    // Orden optimizado: index.html primero, luego Build/, después el resto
    const indexFiles = fileArray.filter(
      (file) => file.name.toLowerCase() === "index.html"
    );
    const buildFiles = fileArray.filter((file) =>
      file.webkitRelativePath.toLowerCase().includes("build/")
    );
    const otherFiles = fileArray.filter(
      (file) =>
        !file.name.toLowerCase().includes("index.html") &&
        !file.webkitRelativePath.toLowerCase().includes("build/")
    );

    const orderedFiles = [...indexFiles, ...buildFiles, ...otherFiles];

    console.log(
      `[DirectUpload] Creando ZIP optimizado con ${orderedFiles.length} archivos...`
    );

    for (let i = 0; i < orderedFiles.length; i++) {
      const file = orderedFiles[i];
      const relativePath = file.webkitRelativePath || file.name;

      const arrayBuffer = await file.arrayBuffer();
      zip.file(relativePath, arrayBuffer);

      if (onProgress) {
        const progress = ((i + 1) / orderedFiles.length) * 100;
        onProgress(progress);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return new File([zipBlob], "game-files.zip", { type: "application/zip" });
  };

  // Función única para subir archivos via HTTPS directo
  const uploadDirect = async (
    file: File,
    fileName: string,
    options: UploadOptions
  ): Promise<UploadResult> => {
    const { themeId } = options;

    console.log(
      `[DirectUpload] Subiendo ${fileName} (${file.size} bytes) via HTTPS directo`
    );

    const formData = new FormData();
    formData.append("gameFile", file, fileName);
    formData.append("themeId", themeId);

    try {
      const response = await fetch(`${DIRECT_HTTPS_URL}/api/games/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("[DirectUpload] Upload exitoso:", result);

      return {
        success: true,
        gameUrl: result.gameUrl,
        filesUploaded: result.filesUploaded || 1,
        themeId,
        files: result.files || [],
        message: "Upload completado via HTTPS directo",
      };
    } catch (error: any) {
      console.error("[DirectUpload] Error en upload:", error);
      throw error;
    }
  };

  // Función principal simplificada
  const smartUploadDirect = async (
    files: FileList,
    themeId: string
  ): Promise<UploadResult> => {
    isDirectUploading.value = true;
    directUploadProgress.value = 0;
    directUploadStep.value = "";
    error.value = null;

    try {
      // Caso 1: Archivo único
      if (files.length === 1) {
        const file = files[0];
        directUploadStep.value = "Subiendo archivo...";
        console.log(`[DirectUpload] Archivo único: ${file.name}`);

        const result = await uploadDirect(file, file.name, {
          themeId,
          onProgress: (progress: number) => {
            directUploadProgress.value = progress;
            directUploadStep.value = `Subiendo... ${Math.round(progress)}%`;
          },
        });

        directUploadProgress.value = 100;
        return result;
      }

      // Caso 2: Múltiples archivos - crear ZIP
      console.log(
        `[DirectUpload] Múltiples archivos: ${files.length} archivos`
      );

      // Detectar si es Unity WebGL
      const isUnityGame = hasUnityStructure(files);
      console.log(`[DirectUpload] Estructura Unity detectada: ${isUnityGame}`);

      directUploadStep.value = "Creando archivo ZIP...";

      const zipFile = await createOptimizedUnityZip(
        files,
        (progress: number) => {
          const totalProgress = progress * 0.3; // 30% para ZIP
          directUploadProgress.value = totalProgress;
          directUploadStep.value = `Creando ZIP... ${Math.round(
            totalProgress
          )}%`;
        }
      );

      console.log(`[DirectUpload] ZIP creado: ${zipFile.size} bytes`);

      directUploadStep.value = "Subiendo archivo ZIP...";

      const result = await uploadDirect(zipFile, "game-files.zip", {
        themeId,
        onProgress: (progress: number) => {
          const totalProgress = 30 + progress * 0.7; // 30% ZIP + 70% upload
          directUploadProgress.value = totalProgress;
          directUploadStep.value = `Subiendo... ${Math.round(totalProgress)}%`;
        },
      });

      directUploadProgress.value = 100;
      return result;
    } catch (err: any) {
      console.error("[DirectUpload] Error:", err);
      error.value = err.message || "Error en upload";
      throw err;
    } finally {
      isDirectUploading.value = false;
    }
  };

  return {
    // Estado
    isDirectUploading: readonly(isDirectUploading),
    directUploadProgress: readonly(directUploadProgress),
    directUploadStep: readonly(directUploadStep),
    error: readonly(error),

    // Función principal (única)
    smartUploadDirect,

    // Funciones de utilidad
    hasUnityStructure,
    createOptimizedUnityZip,
  };
};
