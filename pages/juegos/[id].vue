<template>
  <div class="container mx-auto px-4 py-8">
    <UBreadcrumb
      :links="[
        { label: 'Inicio', to: '/' },
        { label: 'Juegos', to: '/juegos' },
        { label: game?.title || 'Cargando...', to: '' },
      ]"
      class="mb-6"
    />

    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
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
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8"
      >
        <div class="relative">
          <img
            :src="game.coverImage"
            :alt="game.title"
            class="w-full h-64 md:h-80 object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end"
          >
            <div class="p-6 w-full">
              <div class="flex justify-between items-end">
                <div>
                  <UBadge color="primary" class="mb-3">{{ game.theme }}</UBadge>
                  <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                    {{ game.title }}
                  </h1>
                  <p class="text-gray-200">Por {{ game.author }}</p>
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

      <!-- Contenido principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Columna izquierda: Juego WebGL -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Jugar ahora</h2>

            <!-- Área del juego -->
            <div
              v-if="activeTab === 'game'"
              class="bg-gray-900 aspect-video rounded-lg overflow-hidden"
            >
              <iframe
                v-if="game?.gameWebGLUrl"
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

            <!-- Sistema de calificaciones -->
            <div
              v-if="activeTab === 'game' && game?.gameWebGLUrl"
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
                  <div class="text-right">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Tiempo mínimo para puntaje completo
                    </p>
                    <p class="text-sm font-medium">3:00 minutos</p>
                  </div>
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
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="text-green-500"
                  />
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
              <p>
                {{
                  game.instructions ||
                  "No hay instrucciones disponibles para este juego."
                }}
              </p>

              <h4>Controles</h4>
              <ul>
                <li>Teclas de dirección: Mover personaje</li>
                <li>Barra espaciadora: Saltar</li>
                <li>Z: Acción principal</li>
                <li>X: Acción secundaria</li>
                <li>P: Pausar juego</li>
              </ul>

              <h4>Objetivo</h4>
              <p>
                Completa todos los niveles recolectando los elementos especiales
                y evitando los obstáculos para alcanzar la máxima puntuación.
              </p>
            </div>

            <!-- Información técnica -->
            <div
              v-else-if="activeTab === 'info'"
              class="prose dark:prose-invert max-w-none"
            >
              <h3>Información técnica</h3>

              <div class="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h4
                    class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Versión
                  </h4>
                  <p class="font-medium">{{ game.version || "1.0.0" }}</p>
                </div>

                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h4
                    class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Fecha de publicación
                  </h4>
                  <p class="font-medium">{{ formatDate(game.createdAt) }}</p>
                </div>

                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h4
                    class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Motor
                  </h4>
                  <p class="font-medium">Unity WebGL</p>
                </div>

                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h4
                    class="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Tamaño
                  </h4>
                  <p class="font-medium">{{ game.size || "22 MB" }}</p>
                </div>
              </div>

              <h4 class="mt-6">Requisitos</h4>
              <ul>
                <li>Navegador moderno compatible con WebGL</li>
                <li>Conexión a internet estable</li>
                <li>2GB de RAM o superior</li>
                <li>Procesador de doble núcleo o superior</li>
              </ul>
            </div>

            <!-- Pestañas para cambiar de vista -->
            <div
              class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
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
        </div>

        <!-- Columna derecha: Información adicional -->
        <div>
          <!-- Descripción -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Descripción</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
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
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
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

          <!-- Autor -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Autor</h2>
            <div class="flex items-center mb-4">
              <UAvatar
                :src="null"
                :alt="game.author"
                color="primary"
                class="mr-3"
              />
              <div>
                <h3 class="font-semibold">{{ game.author }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Estudiante
                </p>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              Participante de la competencia de minijuegos con temáticas
              chilenas.
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
            <UFormGroup label="Email institucional" name="email" required>
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
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { useRatings } from "~/composables/useRatings";
import { useValidation } from "~/composables/useValidation";

// Definición de metadatos para SEO
definePageMeta({
  title: "Detalle de Juego",
  description: "Visualización y evaluación de juego",
});

// Obtener el ID del juego de la URL
const route = useRoute();
const gameId = route.params.id;
const { $firestore } = useNuxtApp();

// Estados
const isLoading = ref(true);
const game = ref(null);

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
const activeTab = ref("game");

// Obtener los datos del juego desde Firestore
const loadGameData = async () => {
  try {
    console.log(`[Juego] Cargando juego con ID: ${gameId}`);

    if (!$firestore) {
      console.error("[Juego] Firestore no está disponible");
      return;
    }

    // Obtener el documento del juego desde Firestore
    const gameRef = doc($firestore, "themes", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const gameData = gameDoc.data();

      console.log(`[Juego] Datos del juego encontrado:`, {
        id: gameDoc.id,
        title: gameData.title,
        gameStatus: gameData.gameStatus,
        hasWebGLUrl: !!gameData.gameWebGLUrl,
        gameWebGLUrl: gameData.gameWebGLUrl,
        available: gameData.available,
        reservedBy: gameData.reservedBy,
      });

      // Mostrar información del juego independientemente de su estado
      game.value = {
        id: gameDoc.id,
        title: gameData.title,
        description: gameData.description,
        author: gameData.reservedBy || "Autor desconocido",
        theme: gameData.title,
        coverImage:
          gameData.gameImage ||
          "https://placehold.co/1200x600?text=" +
            encodeURIComponent(gameData.title),
        gameWebGLUrl: gameData.gameWebGLUrl,
        gameFiles: gameData.gameFiles || [],
        createdAt:
          gameData.gameUploadedAt?.toDate() ||
          gameData.reservedAt?.toDate() ||
          new Date(),
        tags: gameData.tags || [],
        teammateEmail: gameData.teammateEmail,
        teammateName: gameData.teammateName,
        gameStatus: gameData.gameStatus,
        // Calificación promedio (se calculará desde las calificaciones reales)
        rating: 0,
      };

      // Actualizar los metadatos de la página
      updateHead({
        title: `${gameData.title} - GameCraft2025`,
        description: gameData.description.slice(0, 160),
      });

      if (gameData.gameStatus === "completed" && gameData.gameWebGLUrl) {
        console.log(`[Juego] Juego listo para jugar: ${gameData.title}`);
      } else {
        console.log(
          `[Juego] Juego en desarrollo (estado: ${
            gameData.gameStatus
          }, WebGL: ${!!gameData.gameWebGLUrl})`
        );
      }
    } else {
      console.log(`[Juego] No se encontró juego con ID: ${gameId}`);
      game.value = null;
    }
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

// Abrir formulario de calificación
const openRatingForm = () => {
  if (!game.value) return;

  ratingError.value = "";
  ratingSuccess.value = "";
  showRatingForm.value = true;
};

// Manejar envío de calificación
const handleSubmitRating = async () => {
  try {
    ratingError.value = "";

    // Validaciones
    if (!userEmail.value.trim()) {
      ratingError.value = "Por favor ingresa tu email";
      return;
    }

    if (!isValidInstitutionalEmail(userEmail.value)) {
      ratingError.value =
        "Debes usar un email institucional (@santotomas.cl o @alumnos.santotomas.cl)";
      return;
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
      showRatingForm.value = false;
      ratingSuccess.value = `¡Gracias por tu calificación! Otorgaste ${selectedRating.value} estrellas. Tu puntaje final fue calculado en base al tiempo jugado (${formattedPlayTime.value}).`;

      // Limpiar formulario
      userEmail.value = "";
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
});

onMounted(async () => {
  await loadGameData();
  isLoading.value = false;
});

// Actualizar los metadatos de la página
const updateHead = (meta) => {
  useHead({
    title: meta.title,
    meta: [{ name: "description", content: meta.description }],
  });
};

// Formatear fecha
const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};
</script>
