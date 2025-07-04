<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-4">Mi Juego</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Información sobre tu temática reservada y estado de tu juego.
          </p>
        </div>

        <!-- Botón para refrescar -->
        <UButton
          v-if="isLoggedIn"
          @click="refreshUserData"
          color="primary"
          variant="soft"
          :loading="isLoading"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" />
          </template>
          Actualizar datos
        </UButton>
      </div>
    </div>

    <!-- Pantalla de carga -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <!-- Mensaje si el usuario no está autenticado -->
    <div v-else-if="!isLoggedIn" class="text-center py-16">
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Acceso restringido</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Debes iniciar sesión para acceder a esta sección y ver la información de
        tu juego.
      </p>
      <UButton to="/ingresar" color="primary" size="lg">
        Iniciar sesión
      </UButton>
    </div>

    <!-- Mensaje si el usuario no ha reservado ninguna temática -->
    <div v-else-if="!userHasTheme && !isUserTeammate" class="text-center py-16">
      <UIcon
        name="i-heroicons-puzzle-piece"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Aún no has reservado temática</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Para desarrollar tu juego, primero debes reservar una temática
        disponible. Las temáticas son la base creativa de tu proyecto.
      </p>
      <UButton to="/tematicas" color="primary" size="lg">
        Ver temáticas disponibles
      </UButton>
    </div>

    <!-- Contenido cuando el usuario tiene una temática reservada -->
    <div v-else-if="themeDetails">
      <!-- Tarjeta de la temática -->
      <UCard class="mb-8 overflow-hidden border-0 shadow-lg">
        <template #header>
          <div class="relative bg-primary/10 rounded-t-lg p-6">
            <div class="flex items-center">
              <div
                class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md border-2 border-white dark:border-gray-800"
              >
                {{ getThemeNumber(themeDetails) }}
              </div>
              <div>
                <h2 class="text-2xl font-bold">{{ themeDetails.title }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Reservada el {{ formatDate(reservationDate) }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <div class="p-6">
          <div class="prose dark:prose-invert max-w-none">
            <h3 class="text-xl font-semibold mb-4">Descripción</h3>
            <p>{{ themeDetails.description }}</p>
          </div>
        </div>
      </UCard>

      <!-- Sección de Upload del Juego -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Subir Juego WebGL</h3>
          </div>
        </template>

        <div class="p-6">
          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors"
            :class="{
              'border-primary bg-primary/5': isGameDragging,
            }"
            @dragover.prevent="isGameDragging = true"
            @dragleave.prevent="isGameDragging = false"
            @drop.prevent="handleGameFolderDrop"
          >
            <!-- Estado de subida -->
            <div v-if="isDirectUploading" class="text-center">
              <UIcon
                name="i-heroicons-arrow-path"
                class="animate-spin h-12 w-12 text-primary mx-auto mb-4"
              />
              <p class="text-lg font-medium mb-2">Subiendo juego...</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {{ directUploadStep }}
              </p>
              <div
                class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2"
              >
                <div
                  class="bg-primary h-2 rounded-full transition-all duration-300"
                  :style="{ width: directUploadProgress + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500">
                {{ Math.round(directUploadProgress) }}%
              </p>
            </div>

            <!-- Archivos seleccionados -->
            <div v-else-if="selectedGameFiles && selectedGameFiles.length > 0">
              <UIcon
                name="i-heroicons-folder"
                class="h-12 w-12 text-primary mx-auto mb-4"
              />
              <p class="text-lg font-medium mb-2">
                {{ selectedGameFiles.length }} archivos seleccionados
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Carpeta: {{ selectedGameFolderName }}
              </p>
              <div class="flex justify-center space-x-3">
                <UButton
                  color="primary"
                  :loading="isDirectUploading"
                  @click="() => uploadGame()"
                  icon="i-heroicons-cloud-arrow-up"
                >
                  Subir juego
                </UButton>
                <UButton
                  color="gray"
                  variant="ghost"
                  @click="cancelGameSelection"
                  icon="i-heroicons-x-mark"
                >
                  Cancelar
                </UButton>
              </div>
            </div>

            <!-- Estado inicial -->
            <div v-else>
              <UIcon
                name="i-heroicons-folder-plus"
                class="h-12 w-12 text-gray-400 mx-auto mb-4"
              />
              <p class="text-lg font-medium mb-2">Sube tu juego WebGL</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Arrastra la carpeta de tu build de Unity aquí, selecciona
                archivos individuales, o sube un archivo ZIP
              </p>
              <div class="flex justify-center space-x-3 flex-wrap gap-2">
                <UButton
                  color="primary"
                  @click="triggerGameFolderInput"
                  icon="i-heroicons-folder"
                >
                  Seleccionar carpeta
                </UButton>
                <UButton
                  color="primary"
                  variant="soft"
                  @click="triggerGameFilesInput"
                  icon="i-heroicons-document-plus"
                >
                  Seleccionar archivos
                </UButton>
                <UButton
                  color="green"
                  variant="soft"
                  @click="triggerZipInput"
                  icon="i-heroicons-archive-box"
                >
                  Subir ZIP
                </UButton>
              </div>
            </div>
          </div>

          <!-- Inputs ocultos -->
          <input
            ref="gameFolderInput"
            type="file"
            class="hidden"
            webkitdirectory
            directory
            multiple
            @change="handleGameFolderSelect"
          />
          <input
            ref="gameFilesInput"
            type="file"
            class="hidden"
            multiple
            @change="handleGameFilesSelect"
          />
          <input
            ref="zipInput"
            type="file"
            class="hidden"
            accept=".zip"
            @change="handleZipSelect"
          />

          <p class="text-xs text-gray-500 dark:text-gray-500 mt-3">
            Sistema simplificado: TODOS los archivos se suben via HTTPS directo
            (192.95.7.30:8443)
          </p>
        </div>
      </UCard>

      <!-- Información del juego si existe -->
      <UCard v-if="gameDetails" class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Estado del Juego</h3>
          </div>
        </template>

        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <UBadge
              :color="getStatusColor(gameDetails.gameStatus)"
              variant="subtle"
              class="font-medium"
            >
              {{ getStatusLabel(gameDetails.gameStatus) }}
            </UBadge>

            <div v-if="gameDetails.gameWebGLUrl" class="flex space-x-2">
              <UButton
                :href="gameDetails.gameWebGLUrl"
                target="_blank"
                color="primary"
                icon="i-heroicons-play"
              >
                Jugar
              </UButton>
              <UButton
                color="red"
                variant="ghost"
                @click="deleteGame"
                icon="i-heroicons-trash"
              >
                Eliminar
              </UButton>
            </div>
          </div>

          <div
            v-if="gameDetails.gameFilesCount"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            Archivos subidos: {{ gameDetails.gameFilesCount }}
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useGames } from "~/composables/useGames";
import { useDirectUpload } from "~/composables/useDirectUpload";
import { collection, query, getDocs, where } from "firebase/firestore";

// Metadatos para SEO
definePageMeta({
  title: "Mi Juego",
  description:
    "Gestiona tu juego y consulta la información de tu temática reservada",
});

// Estado básico
const isLoading = ref(true);
const gameDetails = ref(null);
const themeDetails = ref(null);
const reservationDate = ref(null);

// Estado para upload de juegos
const gameFolderInput = ref(null);
const gameFilesInput = ref(null);
const zipInput = ref(null);
const selectedGameFiles = ref([]);
const selectedGameFolderName = ref("");
const isGameDragging = ref(false);

// 🎯 SOLO SISTEMA DIRECTO HTTPS - Sistema simplificado
const {
  isDirectUploading,
  directUploadProgress,
  directUploadStep,
  error: directUploadError,
  smartUploadDirect,
} = useDirectUpload();

// Hooks para autenticación
const {
  isAuthenticated: isLoggedIn,
  user,
  userData,
  waitForAuthInitialized,
} = useAuth();
const toast = useToast();

// Computadas
const userHasTheme = computed(() => {
  return userData.value?.reservedTheme?.id ? true : false;
});

const isUserTeammate = computed(() => {
  return themeDetails.value?.teammateEmail === user.value?.email;
});

// Utilidades
const getStatusColor = (status) => {
  switch (status) {
    case "publicado":
      return "green";
    case "in_progress":
      return "amber";
    default:
      return "gray";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "publicado":
      return "Publicado";
    case "in_progress":
      return "En progreso";
    default:
      return "No iniciado";
  }
};

const formatDate = (date) => {
  if (!date) return "Fecha no disponible";
  try {
    if (date && typeof date === "object" && date.seconds) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date.seconds * 1000));
    }
    if (date instanceof Date) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    }
    return "Fecha no disponible";
  } catch (error) {
    console.error("[MisJuegos] Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

const getThemeNumber = (theme) => {
  if (!theme || !theme.id) return "N";
  if (theme && theme.numero !== undefined) {
    return theme.numero;
  }
  const matches = theme.id.match(/tema(\d+)/i);
  if (matches && matches[1]) {
    return matches[1];
  }
  return "1";
};

// Funciones de manejo de archivos
const triggerGameFolderInput = () => {
  if (gameFolderInput.value) {
    gameFolderInput.value.click();
  }
};

const triggerGameFilesInput = () => {
  if (gameFilesInput.value) {
    gameFilesInput.value.click();
  }
};

const triggerZipInput = () => {
  if (zipInput.value) {
    zipInput.value.click();
  }
};

const handleGameFolderSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    selectedGameFiles.value = files;
    selectedGameFolderName.value =
      files[0].webkitRelativePath.split("/")[0] || "Carpeta seleccionada";
  }
};

const handleGameFilesSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    selectedGameFiles.value = files;
    selectedGameFolderName.value = "Archivos seleccionados";
  }
};

const handleZipSelect = async (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    const zipFile = files[0];
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      toast.add({
        title: "Error",
        description: "Por favor selecciona un archivo ZIP",
        color: "red",
      });
      return;
    }
    // Subir directamente el ZIP
    await uploadGame([zipFile]);
  }
};

const handleGameFolderDrop = (event) => {
  isGameDragging.value = false;
  const items = event.dataTransfer.items;
  const files = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length > 0) {
    selectedGameFiles.value = files;
    selectedGameFolderName.value = "Archivos arrastrados";
  }
};

const cancelGameSelection = () => {
  selectedGameFiles.value = [];
  selectedGameFolderName.value = "";
  if (gameFolderInput.value) gameFolderInput.value.value = "";
  if (gameFilesInput.value) gameFilesInput.value.value = "";
  if (zipInput.value) zipInput.value.value = "";
};

// 🎯 FUNCIÓN ÚNICA SIMPLIFICADA - Solo sistema directo HTTPS
const uploadGame = async (files = null) => {
  const filesToUpload = files || selectedGameFiles.value;

  if (!filesToUpload.length || !gameDetails.value?.id) {
    toast.add({
      title: "Error",
      description:
        "No hay archivos seleccionados o no se pudo identificar el juego",
      color: "red",
    });
    return;
  }

  try {
    console.log(
      `[MisJuegos] Iniciando upload directo HTTPS para tema: ${gameDetails.value.id}`
    );

    // 🚀 Upload directo via HTTPS (bypassing Cloudflare y nginx-proxy)
    const result = await smartUploadDirect(filesToUpload, gameDetails.value.id);

    if (result.success && result.gameUrl) {
      console.log(`[MisJuegos] ✅ Upload directo exitoso:`, result);

      // Actualizar Firestore
      const { $firestore } = useNuxtApp();
      const themeRef = doc($firestore, "themes", gameDetails.value.id);

      await updateDoc(themeRef, {
        gameWebGLUrl: result.gameUrl,
        gameLocalPath: `/games/${gameDetails.value.id}/`,
        gameFilesCount: result.filesUploaded,
        gameUploadedAt: serverTimestamp(),
        gameStatus: "publicado",
        lastUpdated: serverTimestamp(),
      });

      // Actualizar UI local
      gameDetails.value = {
        ...gameDetails.value,
        gameWebGLUrl: result.gameUrl,
        gameLocalPath: `/games/${gameDetails.value.id}/`,
        gameFilesCount: result.filesUploaded,
        gameUploadedAt: new Date(),
        gameStatus: "publicado",
      };

      // Recargar datos
      await loadGameDetails(gameDetails.value.id, true);

      toast.add({
        title: "¡Juego subido correctamente!",
        description: `${result.filesUploaded} archivos procesados via HTTPS directo`,
        color: "green",
      });

      // Limpiar selección
      cancelGameSelection();
    } else {
      throw new Error(result.message || "Error desconocido en upload");
    }
  } catch (error) {
    console.error("[MisJuegos] Error en upload directo:", error);
    toast.add({
      title: "Error al subir el juego",
      description: error.message || "Intenta nuevamente",
      color: "red",
    });
  }
};

// Cargar datos de la temática
const loadUserTheme = async () => {
  if (!isLoggedIn.value || !user.value?.email) {
    isLoading.value = false;
    return;
  }

  try {
    const { $firestore } = useNuxtApp();
    isLoading.value = true;

    if (userData.value?.reservedTheme?.id) {
      const themeId = userData.value.reservedTheme.id;
      reservationDate.value = userData.value.reservedTheme.reservedAt;

      const themeDocRef = doc($firestore, "themes", themeId);
      const themeDoc = await getDoc(themeDocRef);

      if (themeDoc.exists()) {
        themeDetails.value = { ...themeDoc.data(), id: themeDoc.id };
        await loadGameDetails(themeId);
      }
    }
  } catch (error) {
    console.error("[MisJuegos] Error al cargar temática:", error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar detalles del juego
const loadGameDetails = async (themeId, forceReload = false) => {
  try {
    const { $firestore } = useNuxtApp();
    const themeRef = doc($firestore, "themes", themeId);
    const themeDoc = await getDoc(themeRef);

    if (themeDoc.exists()) {
      const data = themeDoc.data();
      gameDetails.value = {
        id: themeId,
        gameStatus: data.gameStatus || "not_started",
        gameWebGLUrl: data.gameWebGLUrl || null,
        gameLocalPath: data.gameLocalPath || null,
        gameFilesCount: data.gameFilesCount || null,
        gameUploadedAt: data.gameUploadedAt || null,
      };
    }
  } catch (error) {
    console.error("[MisJuegos] Error al cargar detalles del juego:", error);
  }
};

// Eliminar juego
const deleteGame = async () => {
  if (!gameDetails.value?.id) return;

  try {
    console.log("[MisJuegos] Eliminando juego...");

    // Actualizar Firestore
    const { $firestore } = useNuxtApp();
    const themeRef = doc($firestore, "themes", gameDetails.value.id);
    await updateDoc(themeRef, {
      gameWebGLUrl: null,
      gameLocalPath: null,
      gameFilesCount: null,
      gameUploadedAt: null,
      gameStatus: "in_progress",
      lastUpdated: serverTimestamp(),
    });

    // Actualizar UI
    gameDetails.value = {
      ...gameDetails.value,
      gameWebGLUrl: null,
      gameLocalPath: null,
      gameFilesCount: null,
      gameUploadedAt: null,
      gameStatus: "in_progress",
    };

    toast.add({
      title: "Juego eliminado",
      description: "El juego ha sido eliminado correctamente",
      color: "green",
    });
  } catch (error) {
    console.error("[MisJuegos] Error al eliminar juego:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar el juego",
      color: "red",
    });
  }
};

// Refrescar datos del usuario
const refreshUserData = async () => {
  await loadUserTheme();
};

// Inicialización
onMounted(async () => {
  await waitForAuthInitialized();
  if (isLoggedIn.value) {
    await loadUserTheme();
  } else {
    isLoading.value = false;
  }
});
</script>
