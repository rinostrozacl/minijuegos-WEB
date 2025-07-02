<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Sistema de Calificaciones</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gestión y visualización de todas las calificaciones de juegos
          </p>
        </div>
        <UBadge color="blue" size="lg" v-if="totalRatings > 0">
          {{ totalRatings }} calificaciones
        </UBadge>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UFormGroup label="Juego">
          <USelect
            v-model="selectedGame"
            :options="gameOptions"
            placeholder="Todos los juegos"
            @change="loadRatings"
          />
        </UFormGroup>

        <UFormGroup label="Calificación mínima">
          <USelect
            v-model="minRating"
            :options="ratingOptions"
            placeholder="Cualquier calificación"
            @change="loadRatings"
          />
        </UFormGroup>

        <UFormGroup label="Tiempo mínimo (minutos)">
          <UInput
            v-model="minPlayTime"
            type="number"
            placeholder="0"
            @input="loadRatings"
          />
        </UFormGroup>
      </div>

      <div class="mt-4 flex gap-2">
        <UButton @click="clearFilters" variant="outline">
          Limpiar filtros
        </UButton>
        <UButton
          @click="exportData"
          color="green"
          icon="i-heroicons-arrow-down-tray"
        >
          Exportar CSV
        </UButton>
      </div>
    </div>

    <!-- Estadísticas generales -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-star" class="text-blue-600 text-xl" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-semibold">{{ stats.totalRatings }}</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Total calificaciones
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon
              name="i-heroicons-chart-bar"
              class="text-green-600 text-xl"
            />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-semibold">
              {{ stats.averageRating.toFixed(1) }}
            </p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Promedio general
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <UIcon name="i-heroicons-clock" class="text-yellow-600 text-xl" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-semibold">
              {{ formatTime(stats.averagePlayTime) }}
            </p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Tiempo promedio
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <UIcon name="i-heroicons-users" class="text-purple-600 text-xl" />
          </div>
          <div class="ml-4">
            <p class="text-2xl font-semibold">{{ stats.uniqueUsers }}</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Usuarios únicos
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de calificaciones -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Calificaciones detalladas</h2>
          <UButton
            @click="exportData"
            color="green"
            icon="i-heroicons-arrow-down-tray"
          >
            Exportar CSV
          </UButton>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Juego
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Calificación
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Puntaje final
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Tiempo jugado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Dispositivo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr v-if="isLoading">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="animate-spin mx-auto mb-2"
                />
                Cargando calificaciones...
              </td>
            </tr>
            <tr v-else-if="filteredRatings.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                No hay calificaciones que mostrar
              </td>
            </tr>
            <tr
              v-else
              v-for="rating in paginatedRatings"
              :key="rating.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ getGameTitle(rating.gameId) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  ID: {{ rating.gameId }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-gray-100">
                  {{ rating.email }}
                </div>
                <div
                  class="text-sm text-gray-500 dark:text-gray-400"
                  v-if="rating.geolocation"
                >
                  📍 {{ rating.geolocation.latitude?.toFixed(3) }},
                  {{ rating.geolocation.longitude?.toFixed(3) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <URating
                    :model-value="rating.rating"
                    :length="5"
                    readonly
                    size="sm"
                  />
                  <span class="ml-2 text-sm font-medium"
                    >{{ rating.rating }}/5</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="
                    rating.finalScore >= rating.rating ? 'green' : 'yellow'
                  "
                  variant="soft"
                >
                  {{ rating.finalScore }}
                </UBadge>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
              >
                {{ formatTime(rating.playTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-gray-100">
                  {{ rating.device }} / {{ rating.platform }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  IP: {{ rating.ipAddress || "N/A" }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              >
                {{
                  formatDate(rating.timestamp?.toDate?.() || rating.timestamp)
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <UButton
                  @click="viewRatingDetails(rating)"
                  size="sm"
                  variant="ghost"
                  icon="i-heroicons-eye"
                >
                  Ver
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        v-if="totalPages > 1"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} a
            {{ Math.min(currentPage * pageSize, filteredRatings.length) }} de
            {{ filteredRatings.length }} resultados
          </div>
          <div class="flex space-x-2">
            <UButton
              @click="currentPage--"
              :disabled="currentPage === 1"
              size="sm"
              variant="outline"
              icon="i-heroicons-chevron-left"
            >
              Anterior
            </UButton>
            <UButton
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              size="sm"
              variant="outline"
              icon="i-heroicons-chevron-right"
            >
              Siguiente
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <UModal v-model="showDetailsModal" :ui="{ width: 'max-w-2xl' }">
      <UCard v-if="selectedRating">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Detalles de calificación</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              class="-my-1"
              @click="showDetailsModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium text-gray-900 dark:text-gray-100">
                Información básica
              </h4>
              <dl class="mt-2 space-y-1 text-sm">
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Juego:</dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ getGameTitle(selectedRating.gameId) }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Usuario:</dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ selectedRating.email }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">
                    Calificación:
                  </dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ selectedRating.rating }}/5 estrellas
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">
                    Puntaje final:
                  </dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ selectedRating.finalScore }}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 dark:text-gray-100">
                Tracking
              </h4>
              <dl class="mt-2 space-y-1 text-sm">
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">
                    Tiempo jugado:
                  </dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ formatTime(selectedRating.playTime) }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Dispositivo:</dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ selectedRating.device }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">Plataforma:</dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ selectedRating.platform }}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600 dark:text-gray-400">IP:</dt>
                  <dd class="text-gray-900 dark:text-gray-100">
                    {{ selectedRating.ipAddress || "N/A" }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div v-if="selectedRating.geolocation">
            <h4 class="font-medium text-gray-900 dark:text-gray-100">
              Geolocalización
            </h4>
            <dl class="mt-2 space-y-1 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-600 dark:text-gray-400">Latitud:</dt>
                <dd class="text-gray-900 dark:text-gray-100">
                  {{ selectedRating.geolocation.latitude }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600 dark:text-gray-400">Longitud:</dt>
                <dd class="text-gray-900 dark:text-gray-100">
                  {{ selectedRating.geolocation.longitude }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600 dark:text-gray-400">Precisión:</dt>
                <dd class="text-gray-900 dark:text-gray-100">
                  {{ selectedRating.geolocation.accuracy }}m
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100">
              Técnico
            </h4>
            <dl class="mt-2 space-y-1 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-600 dark:text-gray-400">Session ID:</dt>
                <dd class="text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {{ selectedRating.sessionId }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600 dark:text-gray-400">Fingerprint:</dt>
                <dd class="text-gray-900 dark:text-gray-100 font-mono text-xs">
                  {{ selectedRating.fingerprint }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600 dark:text-gray-400">User Agent:</dt>
                <dd class="text-gray-900 dark:text-gray-100 text-xs break-all">
                  {{ selectedRating.userAgent }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRatings } from "~/composables/useRatings";

// Metadata de la página
definePageMeta({
  layout: "admin",
  middleware: "admin",
  title: "Calificaciones",
});

// Composables
const { getGameRatings, getGameStats } = useRatings();

// Estados
const isLoading = ref(true);
const allRatings = ref([]);
const games = ref([]);
const stats = ref({
  totalRatings: 0,
  averageRating: 0,
  averagePlayTime: 0,
  uniqueUsers: 0,
});

// Filtros
const selectedGame = ref("");
const minRating = ref("");
const minPlayTime = ref("");

// Paginación
const currentPage = ref(1);
const pageSize = 25;

// Modal
const showDetailsModal = ref(false);
const selectedRating = ref(null);

// Opciones para filtros
const gameOptions = computed(() => [
  { value: "", label: "Todos los juegos" },
  ...games.value.map((game) => ({
    value: game.id,
    label: game.title,
  })),
]);

const ratingOptions = [
  { value: "", label: "Cualquier calificación" },
  { value: "1", label: "1+ estrellas" },
  { value: "2", label: "2+ estrellas" },
  { value: "3", label: "3+ estrellas" },
  { value: "4", label: "4+ estrellas" },
  { value: "5", label: "5 estrellas" },
];

// Calificaciones filtradas
const filteredRatings = computed(() => {
  let filtered = allRatings.value;

  if (selectedGame.value) {
    filtered = filtered.filter((r) => r.gameId === selectedGame.value);
  }

  if (minRating.value) {
    filtered = filtered.filter((r) => r.rating >= parseInt(minRating.value));
  }

  if (minPlayTime.value) {
    const minSeconds = parseInt(minPlayTime.value) * 60;
    filtered = filtered.filter((r) => r.playTime >= minSeconds);
  }

  return filtered.sort((a, b) => {
    const dateA = a.timestamp?.toDate?.() || a.timestamp;
    const dateB = b.timestamp?.toDate?.() || b.timestamp;
    return new Date(dateB) - new Date(dateA);
  });
});

// Calificaciones paginadas
const paginatedRatings = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredRatings.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRatings.value.length / pageSize);
});

const totalRatings = computed(() => filteredRatings.value.length);

// Métodos
const loadGames = async () => {
  try {
    // Cargar juegos desde la colección themes
    const { $firestore } = useNuxtApp();
    if (!$firestore) return;

    const gamesQuery = query(
      collection($firestore, "themes"),
      where("gameStatus", "==", "publicado")
    );

    const gamesSnapshot = await getDocs(gamesQuery);
    games.value = gamesSnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
    }));
  } catch (error) {
    console.error("[Admin] Error cargando juegos:", error);
  }
};

const loadRatings = async () => {
  try {
    isLoading.value = true;

    // Cargar todas las calificaciones
    const { $firestore } = useNuxtApp();
    if (!$firestore) return;

    const ratingsQuery = query(
      collection($firestore, "ratings"),
      orderBy("timestamp", "desc")
    );

    const ratingsSnapshot = await getDocs(ratingsQuery);
    allRatings.value = ratingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calcular estadísticas
    calculateStats();
  } catch (error) {
    console.error("[Admin] Error cargando calificaciones:", error);
  } finally {
    isLoading.value = false;
  }
};

const calculateStats = () => {
  const ratings = allRatings.value;

  if (ratings.length === 0) {
    stats.value = {
      totalRatings: 0,
      averageRating: 0,
      averagePlayTime: 0,
      uniqueUsers: 0,
    };
    return;
  }

  const totalRatings = ratings.length;
  const averageRating =
    ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
  const averagePlayTime =
    ratings.reduce((sum, r) => sum + r.playTime, 0) / totalRatings;
  const uniqueUsers = new Set(ratings.map((r) => r.email)).size;

  stats.value = {
    totalRatings,
    averageRating,
    averagePlayTime,
    uniqueUsers,
  };
};

const getGameTitle = (gameId) => {
  const game = games.value.find((g) => g.id === gameId);
  return game?.title || `Juego ${gameId}`;
};

const clearFilters = () => {
  selectedGame.value = "";
  minRating.value = "";
  minPlayTime.value = "";
  currentPage.value = 1;
};

const viewRatingDetails = (rating) => {
  selectedRating.value = rating;
  showDetailsModal.value = true;
};

const exportData = () => {
  const headers = [
    "Juego",
    "Email",
    "Calificación",
    "Puntaje Final",
    "Tiempo Jugado (segundos)",
    "Dispositivo",
    "Plataforma",
    "IP",
    "Latitud",
    "Longitud",
    "Precisión",
    "Fingerprint",
    "Session ID",
    "Fecha",
  ];

  const rows = filteredRatings.value.map((rating) => [
    getGameTitle(rating.gameId),
    rating.email,
    rating.rating,
    rating.finalScore,
    rating.playTime,
    rating.device,
    rating.platform,
    rating.ipAddress || "",
    rating.geolocation?.latitude || "",
    rating.geolocation?.longitude || "",
    rating.geolocation?.accuracy || "",
    rating.fingerprint,
    rating.sessionId,
    formatDate(rating.timestamp?.toDate?.() || rating.timestamp),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `calificaciones_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  link.click();
};

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Lifecycle
onMounted(async () => {
  await Promise.all([loadGames(), loadRatings()]);
});
</script>
