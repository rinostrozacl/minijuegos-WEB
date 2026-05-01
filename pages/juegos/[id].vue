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
                <div v-if="game.rating" class="hidden md:block">
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
              v-if="activeTab === 'game' && game?.gameWebGLUrl"
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

          <!-- Área del juego con altura optimizada -->
          <div
            v-if="activeTab === 'game'"
            class="bg-gray-900 rounded-lg overflow-hidden"
            style="
              height: calc(100vh - 250px);
              min-height: 450px;
              max-height: 1000px;
            "
          >
            <iframe
              v-if="game?.gameWebGLUrl"
              ref="gameIframe"
              :src="game.gameWebGLUrl"
              class="w-full h-full border-0"
              allowfullscreen
              title="Juego WebGL"
              @load="onIframeLoad"
            />
            <div v-else class="flex items-center justify-center h-full">
              <div class="text-center">
                <UIcon
                  name="i-heroicons-play-circle"
                  class="h-16 w-16 text-white mb-4"
                />
                <p class="text-white">Juego no disponible</p>
                <p class="text-sm text-gray-400 mt-2">
                  El juego aún no ha sido subido
                </p>
              </div>
            </div>
          </div>

          <!-- Sistema de calificaciones (solo juegos publicados) -->
          <div
            v-if="activeTab === 'game' && game?.gameWebGLUrl && gameCatalogPublic"
            class="mt-6 space-y-4"
          >
            <!-- Contador de tiempo -->
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Tiempo de juego
                  </p>
                  <p class="text-lg font-semibold">{{ formattedPlayTime }}</p>
                </div>
                <div class="text-right"></div>
              </div>
            </div>

            <!-- Botón para calificar -->
            <div v-if="!hasRated" class="text-center">
              <UButton
                @click="openRatingForm"
                size="lg"
                color="primary"
                icon="i-heroicons-star"
              >
                Calificar este juego
              </UButton>
            </div>

            <!-- Calificación existente -->
            <div
              v-else
              class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-check-circle" class="text-green-500" />
                <p class="text-green-700 dark:text-green-300">
                  Ya calificaste este juego con
                  {{ existingUserRating?.rating }} estrellas (Puntaje final:
                  {{ existingUserRating?.finalScore }})
                </p>
              </div>
            </div>

            <!-- Mensajes de éxito/error -->
            <UAlert
              v-if="ratingSuccess"
              color="green"
              variant="soft"
              :title="ratingSuccess"
              :close-button="{
                icon: 'i-heroicons-x-mark-20-solid',
                color: 'gray',
                variant: 'link',
                padded: false,
              }"
              @close="ratingSuccess = ''"
            />

            <UAlert
              v-if="ratingError"
              color="red"
              variant="soft"
              :title="ratingError"
              :close-button="{
                icon: 'i-heroicons-x-mark-20-solid',
                color: 'gray',
                variant: 'link',
                padded: false,
              }"
              @close="ratingError = ''"
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

        <!-- Información adicional - Ahora debajo del juego -->
        <div
          class="grid grid-cols-1 gap-6"
          :class="gameCatalogPublic ? 'md:grid-cols-3' : 'md:grid-cols-2'"
        >
          <!-- Descripción -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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

          <!-- Calificación -->
          <div
            v-if="gameCatalogPublic"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Calificación</h2>
              <UBadge v-if="game.rating" color="yellow" size="lg">
                <template #leading>
                  <UIcon name="i-heroicons-star" />
                </template>
                {{ game.rating.toFixed(1) }}
              </UBadge>
            </div>

            <div class="mt-6">
              <UButton
                color="primary"
                block
                @click="openRatingForm"
                :disabled="hasRated"
              >
                <template #leading>
                  <UIcon name="i-heroicons-star" />
                </template>
                {{
                  hasRated
                    ? "Ya calificaste este juego"
                    : "Calificar este juego"
                }}
              </UButton>
            </div>
          </div>

          <!-- Equipo -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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

      <!-- Modal de calificación -->
      <UModal v-model="showRatingForm" :ui="{ width: 'max-w-md' }">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Calificar juego</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="-my-1"
                @click="showRatingForm = false"
              />
            </div>
          </template>

          <form @submit.prevent="handleSubmitRating" class="space-y-6">
            <UFormGroup
              v-if="isFirstTime"
              label="Email institucional"
              name="email"
              required
            >
              <UInput
                v-model="userEmail"
                type="email"
                placeholder="tu-email@santotomas.cl"
                :disabled="isSubmittingRating"
              />
              <template #help>
                Usa tu email institucional (@santotomas.cl o
                @alumnos.santotomas.cl)
              </template>
            </UFormGroup>

            <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Calificando como: <strong>{{ userEmail }}</strong>
              </p>
            </div>

            <UFormGroup label="Calificación" name="rating" required>
              <div class="space-y-2">
                <URating
                  v-model="selectedRating"
                  :length="5"
                  :half="false"
                  size="lg"
                />
                <p
                  v-if="selectedRating > 0"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  {{ selectedRating }}
                  {{ selectedRating === 1 ? "estrella" : "estrellas" }}
                </p>
              </div>
            </UFormGroup>

            <div
              class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <div class="flex items-start gap-2">
                <UIcon
                  name="i-heroicons-information-circle"
                  class="text-blue-500 mt-0.5"
                />
                <div>
                  <p
                    class="text-sm text-blue-700 dark:text-blue-300 font-medium"
                  >
                    Cálculo de puntaje
                  </p>
                  <p class="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Tu puntaje final se calcula basado en el tiempo jugado.
                    Juega al menos 3 minutos para obtener el puntaje completo.
                  </p>
                  <p class="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    <strong>Tiempo actual:</strong> {{ formattedPlayTime }}
                  </p>
                </div>
              </div>
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="gray"
                variant="solid"
                @click="showRatingForm = false"
                :disabled="isSubmittingRating"
              >
                Cancelar
              </UButton>
              <UButton
                color="primary"
                :loading="isSubmittingRating"
                @click="handleSubmitRating"
                :disabled="!selectedRating || !userEmail"
              >
                Enviar calificación
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { useRatings } from "~/composables/useRatings";
import { useValidation } from "~/composables/useValidation";
import { displayGameTitle } from "~/composables/useGames";
import {
  normalizeGameStatus,
  GAME_STATUS,
} from "~/composables/useGameStatus";

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

// Sistema de calificaciones
const {
  isSubmitting: isSubmittingRating,
  hasRated,
  userRating: existingUserRating,
  currentPlayTime,
  formattedPlayTime,
  startGameTracking,
  stopGameTracking,
  submitRating,
  checkExistingRating,
  cleanup,
} = useRatings();

// Validación de email
const { isValidInstitutionalEmail } = useValidation();

// Estados para el formulario de calificación
const showRatingForm = ref(false);
const userEmail = ref("");
const selectedRating = ref(0);
const ratingError = ref("");
const ratingSuccess = ref("");
const isFirstTime = ref(true);
const activeTab = ref("game");

const gameCatalogPublic = computed(
  () => normalizeGameStatus(game.value?.gameStatus) === GAME_STATUS.PUBLICADO
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

// Manejar iframe load para iniciar tracking
const onIframeLoad = () => {
  console.log("[Juego] Iframe cargado, iniciando tracking de tiempo");
  startGameTracking();
};

// Función para activar/desactivar pantalla completa
const toggleFullscreen = async () => {
  try {
    if (!gameIframe.value) {
      console.warn("[Juego] No se encontró el iframe del juego");
      return;
    }

    if (!document.fullscreenElement) {
      // Entrar en pantalla completa
      if (gameIframe.value.requestFullscreen) {
        await gameIframe.value.requestFullscreen();
      } else if (gameIframe.value.webkitRequestFullscreen) {
        // Safari
        await gameIframe.value.webkitRequestFullscreen();
      } else if (gameIframe.value.msRequestFullscreen) {
        // IE/Edge
        await gameIframe.value.msRequestFullscreen();
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

// Verificar si ya calificó este juego
const checkUserRating = async () => {
  if (!game.value || !userEmail.value) return;

  try {
    const existing = await checkExistingRating(game.value.id, userEmail.value);
    if (existing) {
      hasRated.value = true;
      existingUserRating.value = existing;
      ratingSuccess.value = `Ya calificaste este juego con ${existing.rating} estrellas (${existing.finalScore} puntos)`;
    }
  } catch (error) {
    console.error("[Juego] Error verificando calificación existente:", error);
  }
};

// Cargar email guardado del localStorage
const loadSavedEmail = () => {
  const savedEmail = localStorage.getItem("gameRatingEmail");
  if (savedEmail) {
    userEmail.value = savedEmail;
    isFirstTime.value = false;
  } else {
    isFirstTime.value = true;
  }
};

// Guardar email en localStorage
const saveEmailToStorage = (email) => {
  localStorage.setItem("gameRatingEmail", email);
};

// Abrir formulario de calificación
const openRatingForm = () => {
  if (!game.value) return;

  ratingError.value = "";
  ratingSuccess.value = "";
  loadSavedEmail(); // Cargar email guardado si existe
  showRatingForm.value = true;
};

// Manejar envío de calificación
const handleSubmitRating = async () => {
  try {
    ratingError.value = "";

    // Validaciones
    if (isFirstTime.value) {
      if (!userEmail.value.trim()) {
        ratingError.value = "Por favor ingresa tu email";
        return;
      }

      if (!isValidInstitutionalEmail(userEmail.value)) {
        ratingError.value =
          "Debes usar un email institucional o un correo autorizado para pruebas";
        return;
      }
    }

    if (selectedRating.value < 1 || selectedRating.value > 5) {
      ratingError.value = "Por favor selecciona una calificación";
      return;
    }

    // Verificar si ya calificó
    await checkUserRating();
    if (hasRated.value) {
      ratingError.value = "Ya has calificado este juego anteriormente";
      return;
    }

    // Enviar calificación
    const success = await submitRating(
      game.value.id,
      userEmail.value,
      selectedRating.value
    );

    if (success) {
      // Guardar email en localStorage si es primera vez
      if (isFirstTime.value) {
        saveEmailToStorage(userEmail.value);
      }

      showRatingForm.value = false;
      ratingSuccess.value = `¡Gracias por tu calificación! Otorgaste ${selectedRating.value} estrellas.`;

      // Limpiar solo la calificación
      selectedRating.value = 0;
    }
  } catch (error) {
    console.error("[Juego] Error al enviar calificación:", error);
    ratingError.value = error.message || "Error al enviar la calificación";
  }
};

// Cleanup al salir
onUnmounted(() => {
  cleanup();

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
  await loadGameData();
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
