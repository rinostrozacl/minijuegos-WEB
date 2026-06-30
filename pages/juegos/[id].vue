<template>
  <div class="container mx-auto px-4 py-2">
    <UBreadcrumb
      :links="[
        { label: 'Inicio', to: '/' },
        { label: 'Juegos', to: '/juegos' },
        { label: game?.displayTitle || game?.title || 'Cargando...', to: '' },
      ]"
      class="mb-4"
    />

    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <div v-else-if="limitedGame" class="max-w-lg mx-auto text-center py-16">
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">{{ limitedGame.displayTitle }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Este juego aún no está publicado. Solo el equipo y usuarios con acceso
        pueden ver la ficha completa.
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        <UButton to="/ingresar" color="primary">Iniciar sesión</UButton>
        <UButton to="/juegos" variant="soft" color="gray">Volver al listado</UButton>
      </div>
    </div>

    <div v-else-if="!game" class="text-center py-16">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="h-16 w-16 mx-auto text-amber-500 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Juego no encontrado</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        El juego que estás buscando no existe o no está disponible.
      </p>
      <UButton to="/juegos" color="primary"> Ver todos los juegos </UButton>
    </div>

    <template v-else>
      <!-- Cabecera del juego -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-4"
      >
        <div class="relative">
          <img
            :src="game.coverImage"
            :alt="game.displayTitle"
            class="w-full h-48 md:h-64 object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end"
          >
            <div class="p-6 w-full">
              <div class="flex justify-between items-end">
                <div>
                  <UBadge color="primary" class="mb-3">{{ game.theme }}</UBadge>
                  <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    {{ game.displayTitle }}
                  </h1>
                  <p class="text-gray-200">
                    Por {{ game.author }}
                    <template v-if="game.teammateName">
                      y {{ game.teammateName }}</template
                    >
                  </p>
                </div>
                <div v-if="false" class="hidden md:block">
                  <UBadge color="yellow" size="lg" class="text-lg">
                    <template #leading>
                      <UIcon name="i-heroicons-star" />
                    </template>
                    {{ game.rating.toFixed(1) }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal - Layout mejorado -->
      <div class="space-y-6">
        <!-- Área del juego - Ancho completo y altura optimizada -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Jugar ahora</h2>
            <UButton
              v-if="activeTab === 'game' && gamePlayUrl"
              @click="toggleFullscreen"
              color="gray"
              variant="ghost"
              :icon="
                isFullscreen
                  ? 'i-heroicons-arrows-pointing-in'
                  : 'i-heroicons-arrows-pointing-out'
              "
              size="sm"
              :title="
                isFullscreen
                  ? 'Salir de pantalla completa'
                  : isMobileDevice()
                  ? 'Pantalla completa (rotará a horizontal)'
                  : 'Pantalla completa'
              "
            >
              {{
                isFullscreen
                  ? "Salir de pantalla completa"
                  : isMobileDevice()
                  ? "Pantalla completa 📱"
                  : "Pantalla completa"
              }}
            </UButton>
          </div>

          <!-- Área del juego -->
          <div v-if="activeTab === 'game'">
            <GameIframe
              v-if="gamePlayUrl"
              ref="gameIframe"
              :src="gamePlayUrl"
              :canvas-width="game?.gameCanvasWidth"
              :canvas-height="game?.gameCanvasHeight"
              :frame-extra-height="game?.gameFrameExtraHeight"
              :max-height-vh="85"
              title="Juego"
              @load="onIframeLoad"
            />
            <div
              v-else
              class="flex items-center justify-center bg-gray-900 rounded-lg"
              style="min-height: 360px"
            >
              <div class="text-center px-4">
                <UIcon
                  name="i-heroicons-play-circle"
                  class="h-16 w-16 text-white mb-4 mx-auto"
                />
                <p class="text-white">Juego no disponible</p>
                <p class="text-sm text-gray-400 mt-2">
                  El equipo aún no ha enlazado el juego desde GitHub Pages
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'game' && game?.gameUrl && isItchAnnexUrl(game.gameUrl)"
            class="mt-3 text-center"
          >
            <UButton
              :href="game.gameUrl"
              target="_blank"
              variant="soft"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              Ver también en itch.io
            </UButton>
          </div>

          <!-- Evaluación final (feedback bajo el juego) -->
          <div
            v-if="activeTab === 'game' && gamePlayUrl && gameCatalogPublic && isEvalOpen"
            class="mt-6 space-y-4"
          >
            <div v-if="!hasFinalRated" class="text-center">
              <UButton
                size="lg"
                color="primary"
                icon="i-heroicons-star"
                @click="openFinalEvalModal"
              >
                Calificar este juego
              </UButton>
            </div>

            <div
              v-else
              class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="text-green-500" />
                <p class="text-green-700 dark:text-green-300">
                  Ya calificaste este juego en la evaluación final.
                </p>
              </div>
            </div>

            <UAlert
              v-if="finalEvalSuccess"
              color="green"
              variant="soft"
              :title="finalEvalSuccess"
              @close="finalEvalSuccess = ''"
            />

            <UAlert
              v-if="finalEvalError"
              color="red"
              variant="soft"
              :title="finalEvalError"
              @close="finalEvalError = ''"
            />
          </div>

          <!-- Instrucciones -->
          <div
            v-else-if="activeTab === 'instructions'"
            class="prose dark:prose-invert max-w-none"
          >
            <h3>Instrucciones del juego</h3>
            <p class="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {{
                game.instructions?.trim() ||
                "No hay instrucciones disponibles para este juego."
              }}
            </p>
          </div>

          <!-- Información técnica -->
          <div
            v-else-if="activeTab === 'info'"
            class="prose dark:prose-invert max-w-none"
          >
            <h3>Información</h3>

            <div class="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-if="game.publishedAtLabel"
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <h4
                  class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1"
                >
                  Publicado
                </h4>
                <p class="font-medium">{{ game.publishedAtLabel }}</p>
              </div>

              <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4
                  class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1"
                >
                  Última actualización del build
                </h4>
                <p class="font-medium">{{ formatDate(game.createdAt) }}</p>
              </div>
            </div>

            <div v-if="game.gameUrl || game.repositoryUrl" class="not-prose mt-6 space-y-2">
              <h4 class="font-semibold">Enlaces adicionales</h4>
              <p v-if="game.gameUrl">
                <a
                  :href="game.gameUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary underline"
                  >Demo en itch.io</a
                >
              </p>
              <p v-if="game.repositoryUrl">
                <a
                  :href="game.repositoryUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary underline"
                  >Repositorio en GitHub</a
                >
              </p>
            </div>

            <h4 class="mt-6">Requisitos</h4>
            <ul>
              <li>Navegador compatible con WebGL</li>
              <li>Conexión a internet estable</li>
            </ul>
          </div>

          <!-- Pestañas para cambiar de vista -->
          <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex space-x-4">
              <UButton
                @click="activeTab = 'game'"
                :color="activeTab === 'game' ? 'primary' : 'gray'"
                :variant="activeTab === 'game' ? 'solid' : 'ghost'"
              >
                <template #leading>
                  <UIcon name="i-heroicons-play" />
                </template>
                Jugar
              </UButton>

              <UButton
                @click="activeTab = 'instructions'"
                :color="activeTab === 'instructions' ? 'primary' : 'gray'"
                :variant="activeTab === 'instructions' ? 'solid' : 'ghost'"
              >
                <template #leading>
                  <UIcon name="i-heroicons-document-text" />
                </template>
                Instrucciones
              </UButton>

              <UButton
                @click="activeTab = 'info'"
                :color="activeTab === 'info' ? 'primary' : 'gray'"
                :variant="activeTab === 'info' ? 'solid' : 'ghost'"
              >
                <template #leading>
                  <UIcon name="i-heroicons-information-circle" />
                </template>
                Info
              </UButton>
            </div>
          </div>
        </div>

        <!-- Información adicional - 3 columnas a ancho completo -->
        <div
          v-if="gameCatalogPublic"
          class="grid w-full grid-cols-1 gap-6 md:grid-cols-3"
        >
          <!-- Descripción -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Resumen</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {{ game.description }}
            </p>

            <div
              v-if="game.longDescription"
              class="prose dark:prose-invert max-w-none"
            >
              <p v-html="game.longDescription"></p>
            </div>
          </div>

          <!-- Equipo -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Equipo</h2>
            <ul class="space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-medium">Titular:</span> {{ game.author }}
              </li>
              <li v-if="game.teammateName || game.teammateEmail">
                <span class="font-medium">Compañero/a:</span>
                {{ game.teammateName || game.teammateEmail }}
              </li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-4">
              GameCraft2026 — temáticas mitológicas.
            </p>
          </div>

          <!-- Calificar este juego -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col"
          >
            <h2 class="text-xl font-semibold mb-4">Calificar este juego</h2>

            <template v-if="isEvalOpen">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                Califica este juego en Historia, Gráfica, Mecánica y General (1–5 estrellas).
              </p>
              <UButton
                color="primary"
                block
                :disabled="hasFinalRated"
                @click="openFinalEvalModal"
              >
                <template #leading>
                  <UIcon name="i-heroicons-star" />
                </template>
                {{
                  hasFinalRated
                    ? "Ya calificaste este juego"
                    : "Calificar este juego"
                }}
              </UButton>
            </template>

            <template v-else>
              <p class="text-sm text-gray-600 dark:text-gray-400 flex-1">
                {{
                  finalEvalStatus === "finalizada"
                    ? "La evaluación final ya cerró. Gracias por participar."
                    : "La evaluación final aún no está abierta. Podrás calificar este juego cuando el equipo habilite la votación."
                }}
              </p>
              <UButton
                color="primary"
                block
                disabled
              >
                <template #leading>
                  <UIcon name="i-heroicons-star" />
                </template>
                Calificación no disponible
              </UButton>
            </template>
          </div>
        </div>

        <div
          v-else
          class="grid w-full grid-cols-1 gap-6 md:grid-cols-2"
        >
          <!-- Descripción (juego no publicado en catálogo) -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Resumen</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
              {{ game.description }}
            </p>

            <div
              v-if="game.longDescription"
              class="prose dark:prose-invert max-w-none"
            >
              <p v-html="game.longDescription"></p>
            </div>
          </div>

          <!-- Equipo -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Equipo</h2>
            <ul class="space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-medium">Titular:</span> {{ game.author }}
              </li>
              <li v-if="game.teammateName || game.teammateEmail">
                <span class="font-medium">Compañero/a:</span>
                {{ game.teammateName || game.teammateEmail }}
              </li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-4">
              GameCraft2026 — temáticas mitológicas.
            </p>
          </div>
        </div>
      </div>

      <FinalEvalRatingModal
        v-if="game"
        v-model="showFinalEvalModal"
        :game-id="game.id"
        :game-title="game.displayTitle"
        @success="onFinalEvalSuccess"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { displayGameTitle } from "~/composables/useGames";
import {
  normalizeGameStatus,
  GAME_STATUS,
} from "~/composables/useGameStatus";
import {
  isItchAnnexUrl,
  resolveGamePlayUrl,
} from "~/utils/gamePlayUrl";

// Definición de metadatos para SEO
definePageMeta({
  title: "Detalle de Juego",
  description: "Visualización y evaluación de juego",
});

// Obtener el ID del juego de la URL
const route = useRoute();
const gameId = route.params.id;
const { $firestore } = useNuxtApp();

const { user, isAdmin, waitForAuthInitialized } = useAuth();

// Estados
const isLoading = ref(true);
const game = ref(null);
const limitedGame = ref(null);

const {
  isEvalOpen,
  status: finalEvalStatus,
  fetchStatus,
  fetchEligibility,
  checkRated,
  loadSessionFromStorage,
} = useFinalEval();

const showFinalEvalModal = ref(false);
const hasFinalRated = ref(false);
const finalEvalSuccess = ref("");
const finalEvalError = ref("");
const activeTab = ref("game");

const gameCatalogPublic = computed(
  () => normalizeGameStatus(game.value?.gameStatus) === GAME_STATUS.PUBLICADO
);

const gamePlayUrl = computed(() =>
  resolveGamePlayUrl(game.value?.gameWebGLUrl)
);

// Referencia al iframe del juego
const gameIframe = ref(null);
const isFullscreen = ref(false);

const formatDate = (date) => {
  if (!date) return "";
  try {
    const d =
      date?.seconds != null
        ? new Date(date.seconds * 1000)
        : date instanceof Date
          ? date
          : new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return "";
  }
};

const updateHead = (meta) => {
  useHead({
    title: meta.title,
    meta: [{ name: "description", content: meta.description }],
  });
};

// Obtener los datos del juego desde Firestore
const loadGameData = async () => {
  limitedGame.value = null;
  game.value = null;
  try {
    console.log(`[Juego] Cargando juego con ID: ${gameId}`);

    if (!$firestore) {
      console.error("[Juego] Firestore no está disponible");
      return;
    }

    const gameRef = doc($firestore, "themes", gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      console.log(`[Juego] No se encontró juego con ID: ${gameId}`);
      return;
    }

    const gameData = gameDoc.data();
    if (gameData.available === true) {
      return;
    }

    const status = normalizeGameStatus(gameData.gameStatus);
    const uid = user.value?.uid;
    const privileged =
      !!isAdmin.value ||
      (!!uid && uid === gameData.reservedById) ||
      (!!uid && uid === gameData.teammateUid);

    const displayTitle = displayGameTitle({
      gameTitle: gameData.gameTitle,
      title: gameData.title,
    });

    if (status !== GAME_STATUS.PUBLICADO && !privileged) {
      limitedGame.value = { displayTitle, id: gameDoc.id };
      updateHead({
        title: `${displayTitle} - GameCraft2026`,
        description: "Juego no publicado",
      });
      return;
    }

    const publishedAtRaw = gameData.publishedAt;
    const publishedAtDate = publishedAtRaw?.toDate
      ? publishedAtRaw.toDate()
      : publishedAtRaw
        ? new Date(publishedAtRaw)
        : null;

    game.value = {
      id: gameDoc.id,
      title: gameData.title,
      displayTitle,
      description: gameData.description || "",
      longDescription: gameData.longDescription || "",
      instructions: gameData.instructions || "",
      author: gameData.reservedBy || "Autor desconocido",
      theme: gameData.title,
      coverImage:
        gameData.gameImage ||
        "https://placehold.co/1200x600?text=" +
          encodeURIComponent(displayTitle),
      gameWebGLUrl: gameData.gameWebGLUrl,
      gameCanvasWidth: gameData.gameCanvasWidth ?? null,
      gameCanvasHeight: gameData.gameCanvasHeight ?? null,
      gameFrameExtraHeight: gameData.gameFrameExtraHeight ?? null,
      itchGameId: gameData.itchGameId || null,
      gameUrl: gameData.gameUrl || "",
      repositoryUrl: gameData.repositoryUrl || "",
      gameFiles: gameData.gameFiles || [],
      createdAt:
        gameData.gameUploadedAt?.toDate?.() ||
        gameData.gameUploadedAt ||
        gameData.reservedAt?.toDate?.() ||
        gameData.reservedAt ||
        new Date(),
      publishedAtLabel: publishedAtDate ? formatDate(publishedAtDate) : "",
      tags: gameData.tags || [],
      teammateEmail: gameData.teammateEmail,
      teammateName: gameData.teammateName,
      gameStatus: status,
      rating: 0,
    };

    const desc = (gameData.description || "").toString().slice(0, 160);
    updateHead({
      title: `${displayTitle} - GameCraft2026`,
      description: desc || displayTitle,
    });
  } catch (error) {
    console.error("[Juego] Error al cargar el juego:", error);
    game.value = null;
  }
};

// Manejar iframe load
const onIframeLoad = () => {
  console.log("[Juego] Iframe cargado");
};

// Función para activar/desactivar pantalla completa
const toggleFullscreen = async () => {
  try {
    if (!gameIframe.value) {
      console.warn("[Juego] No se encontró el iframe del juego");
      return;
    }

    const frame = gameIframe.value;

    if (!document.fullscreenElement) {
      if (frame.requestFullscreen) {
        await frame.requestFullscreen();
      } else if (frame.webkitRequestFullscreen) {
        await frame.webkitRequestFullscreen();
      } else if (frame.msRequestFullscreen) {
        await frame.msRequestFullscreen();
      }

      // Intentar forzar orientación horizontal en móviles
      // Pequeño delay para que la pantalla completa se establezca primero
      setTimeout(async () => {
        await lockOrientation();
      }, 100);

      console.log("[Juego] Pantalla completa activada");
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        // Safari
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        await document.msExitFullscreen();
      }

      // Liberar orientación al salir de pantalla completa
      unlockOrientation();

      console.log("[Juego] Pantalla completa desactivada");
    }
  } catch (error) {
    console.error("[Juego] Error al cambiar modo pantalla completa:", error);
  }
};

// Función para bloquear orientación en horizontal
const lockOrientation = async () => {
  try {
    // Verificar si estamos en un dispositivo móvil
    if (!isMobileDevice()) {
      console.log(
        "[Juego] No es dispositivo móvil, omitiendo bloqueo de orientación"
      );
      return;
    }

    // API moderna de Screen Orientation
    if (screen?.orientation?.lock) {
      await screen.orientation.lock("landscape");
      console.log("[Juego] Orientación bloqueada en landscape (API moderna)");
    }
    // API legacy para compatibilidad
    else if (screen?.lockOrientation) {
      screen.lockOrientation(["landscape-primary", "landscape-secondary"]);
      console.log("[Juego] Orientación bloqueada en landscape (API legacy)");
    }
    // Webkit para iOS
    else if (screen?.webkitLockOrientation) {
      screen.webkitLockOrientation([
        "landscape-primary",
        "landscape-secondary",
      ]);
      console.log("[Juego] Orientación bloqueada en landscape (Webkit)");
    }
    // Mozilla para Firefox
    else if (screen?.mozLockOrientation) {
      screen.mozLockOrientation(["landscape-primary", "landscape-secondary"]);
      console.log("[Juego] Orientación bloqueada en landscape (Mozilla)");
    } else {
      console.log("[Juego] API de orientación no disponible en este navegador");
    }
  } catch (error) {
    console.warn("[Juego] No se pudo bloquear la orientación:", error.message);
  }
};

// Función para liberar orientación
const unlockOrientation = () => {
  try {
    // API moderna
    if (screen?.orientation?.unlock) {
      screen.orientation.unlock();
      console.log("[Juego] Orientación liberada (API moderna)");
    }
    // API legacy
    else if (screen?.unlockOrientation) {
      screen.unlockOrientation();
      console.log("[Juego] Orientación liberada (API legacy)");
    }
    // Webkit
    else if (screen?.webkitUnlockOrientation) {
      screen.webkitUnlockOrientation();
      console.log("[Juego] Orientación liberada (Webkit)");
    }
    // Mozilla
    else if (screen?.mozUnlockOrientation) {
      screen.mozUnlockOrientation();
      console.log("[Juego] Orientación liberada (Mozilla)");
    }
  } catch (error) {
    console.warn("[Juego] No se pudo liberar la orientación:", error.message);
  }
};

// Función para detectar si es dispositivo móvil
const isMobileDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (window.innerWidth <= 768 && "ontouchstart" in window)
  );
};

async function refreshFinalEvalState() {
  if (!game.value?.id || !isEvalOpen.value) {
    hasFinalRated.value = false;
    return;
  }
  loadSessionFromStorage();
  await fetchEligibility();
  const rated = await checkRated(game.value.id);
  hasFinalRated.value = rated.hasRated;
}

function openFinalEvalModal() {
  if (!isEvalOpen.value) return;
  finalEvalError.value = "";
  showFinalEvalModal.value = true;
}

function onFinalEvalSuccess() {
  hasFinalRated.value = true;
  finalEvalSuccess.value =
    "¡Gracias! Tu calificación fue registrada en la evaluación final.";
}

onUnmounted(() => {
  // Limpiar event listeners
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  document.removeEventListener(
    "webkitfullscreenchange",
    handleFullscreenChange
  );

  // Limpiar listener de orientación
  if (screen?.orientation) {
    screen.orientation.removeEventListener("change", handleOrientationChange);
  }

  // Asegurar que se libere la orientación al salir
  unlockOrientation();
});

onMounted(async () => {
  isLoading.value = true;
  await waitForAuthInitialized();
  await fetchStatus();
  await loadGameData();
  await refreshFinalEvalState();
  isLoading.value = false;

  // Listener para cambios en pantalla completa
  document.addEventListener("fullscreenchange", handleFullscreenChange);

  // Compatibilidad con Safari
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

  // Listener para cambios de orientación
  if (screen?.orientation) {
    screen.orientation.addEventListener("change", handleOrientationChange);
  }
});

// Manejar cambios de pantalla completa
const handleFullscreenChange = () => {
  const isNowFullscreen = !!(
    document.fullscreenElement || document.webkitFullscreenElement
  );
  isFullscreen.value = isNowFullscreen;

  console.log(
    `[Juego] Cambio de pantalla completa: ${
      isNowFullscreen ? "activada" : "desactivada"
    }`
  );

  // Si salimos de pantalla completa, liberar orientación
  if (!isNowFullscreen) {
    unlockOrientation();
  }
};

// Manejar cambios de orientación
const handleOrientationChange = () => {
  if (screen?.orientation) {
    console.log(`[Juego] Orientación cambió a: ${screen.orientation.type}`);
  }
};

</script>
