import JSZip from "jszip";

// Tipos para el upload directo
interface DirectUploadOptions {
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

  // 🚀 URL DIRECTA: Evita nginx-proxy y sus límites de 413
  // IMPORTANTE: Usar HTTPS para evitar Mixed Content error
  // Opción 1: Servidor directo HTTPS
  // const DIRECT_SERVER_URL = "https://192.95.7.30:8081";

  // Opción 2: Dominio principal con endpoint especial
  const DIRECT_SERVER_URL = "https://gamecraft.cl";

  // Detectar si los archivos tienen estructura Unity WebGL
  const hasUnityStructure = (files: File[]): boolean => {
    const fileNames = files.map((f) => f.name.toLowerCase());

    const hasBuildFolder = fileNames.some((name) => name.includes("build/"));
    const hasIndexHtml = fileNames.some(
      (name) => name === "index.html" || name.endsWith("/index.html")
    );
    const hasWasm = fileNames.some(
      (name) => name.endsWith(".wasm") || name.endsWith(".wasm.br")
    );
    const hasFramework = fileNames.some(
      (name) =>
        name.includes("framework.js") || name.includes("framework.js.br")
    );

    return hasBuildFolder && hasIndexHtml && (hasWasm || hasFramework);
  };

  // Crear ZIP optimizado para Unity WebGL
  const createOptimizedUnityZip = async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    const zip = new JSZip();
    let processedFiles = 0;

    // Orden correcto: index.html primero, luego Build/, luego resto
    const indexFiles = files.filter(
      (f) =>
        f.name.toLowerCase() === "index.html" ||
        f.name.toLowerCase().endsWith("/index.html")
    );
    const buildFiles = files.filter(
      (f) => f.name.toLowerCase().includes("build/") && !indexFiles.includes(f)
    );
    const otherFiles = files.filter(
      (f) => !indexFiles.includes(f) && !buildFiles.includes(f)
    );

    const orderedFiles = [...indexFiles, ...buildFiles, ...otherFiles];

    for (const file of orderedFiles) {
      const fileContent = await file.arrayBuffer();
      zip.file(file.name, fileContent);

      processedFiles++;
      if (onProgress) {
        onProgress((processedFiles / files.length) * 100);
      }
    }

    return await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
  };

  // Función para subir archivo directamente
  const uploadFileDirect = async (
    file: File,
    fileName: string,
    options: DirectUploadOptions
  ): Promise<UploadResult> => {
    const { themeId, onProgress } = options;

    console.log(
      `[DirectUpload] Subiendo ${fileName} (${file.size} bytes) directamente al servidor`
    );

    const formData = new FormData();
    formData.append("gameFile", file, fileName);
    formData.append("themeId", themeId);

    try {
      const response = await fetch(
        `${DIRECT_SERVER_URL}/api/games/upload-direct`,
        {
          method: "POST",
          body: formData,
        }
      );

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
        message: "Upload completado exitosamente",
      };
    } catch (error) {
      console.error("[DirectUpload] Error en upload:", error);
      throw error;
    }
  };

  // Función principal para subir juegos con detección automática
  const smartUploadDirect = async (
    files: File[],
    themeId: string
  ): Promise<UploadResult> => {
    if (!files.length) {
      throw new Error("No se proporcionaron archivos");
    }

    try {
      isDirectUploading.value = true;
      directUploadProgress.value = 0;
      error.value = null;

      console.log(
        `[DirectUpload] Iniciando upload directo a ${DIRECT_SERVER_URL}`
      );

      // Caso 1: Un solo archivo ZIP
      if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
        directUploadStep.value = "Subiendo archivo ZIP...";

        const result = await uploadFileDirect(files[0], files[0].name, {
          themeId,
          onProgress: (progress: number) => {
            directUploadProgress.value = progress;
            directUploadStep.value = `Subiendo archivo... ${Math.round(
              progress
            )}%`;
          },
        });

        return result;
      }

      // Caso 2: Múltiples archivos - detectar Unity WebGL
      let zipFileName = "game-files.zip";
      let zipBlob: Blob;

      if (hasUnityStructure(files)) {
        directUploadStep.value = "Detectando juego Unity WebGL...";
        console.log(
          "[DirectUpload] Estructura Unity detectada - creando ZIP optimizado"
        );
        zipFileName = "unity-game.zip";

        directUploadStep.value = "Creando archivo optimizado...";
        zipBlob = await createOptimizedUnityZip(files, (progress: number) => {
          directUploadProgress.value = progress * 0.3; // 30% del progreso total
          directUploadStep.value = `Creando archivo optimizado... ${Math.round(
            progress
          )}%`;
        });
      } else {
        directUploadStep.value = "Creando archivo ZIP...";
        const zip = new JSZip();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileContent = await file.arrayBuffer();
          zip.file(file.name, fileContent);

          const progress = ((i + 1) / files.length) * 100;
          directUploadProgress.value = progress * 0.3;
          directUploadStep.value = `Creando ZIP... ${Math.round(progress)}%`;
        }

        zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
      }

      // Subir el ZIP creado
      directUploadStep.value = "Transfiriendo archivo al servidor...";

      // Crear File desde Blob para mantener compatibilidad
      const zipFile = new File([zipBlob], zipFileName, {
        type: "application/zip",
      });

      const result = await uploadFileDirect(zipFile, zipFileName, {
        themeId,
        onProgress: (progress: number) => {
          const totalProgress = 30 + progress * 0.7; // 30% ZIP + 70% upload
          directUploadProgress.value = totalProgress;
          directUploadStep.value = `Subiendo al servidor... ${Math.round(
            totalProgress
          )}%`;
        },
      });

      directUploadStep.value = "Upload completado exitosamente";
      directUploadProgress.value = 100;

      return result;
    } catch (error: any) {
      console.error("[DirectUpload] Error en smartUploadDirect:", error);
      error.value = error.message || "Error desconocido en upload directo";
      throw error;
    } finally {
      setTimeout(() => {
        isDirectUploading.value = false;
        directUploadProgress.value = 0;
        directUploadStep.value = "";
      }, 2000);
    }
  };

  return {
    // Estado reactivo
    isDirectUploading: readonly(isDirectUploading),
    directUploadProgress: readonly(directUploadProgress),
    directUploadStep: readonly(directUploadStep),
    error: readonly(error),

    // Funciones
    smartUploadDirect,
    hasUnityStructure,
    createOptimizedUnityZip,
  };
};
