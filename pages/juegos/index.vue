<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Juegos Participantes</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Explora los videojuegos de GameCraft2026 con temáticas mitológicas.
      </p>

      <!-- Botón para actualizar datos de compañeros -->
      <div v-if="isAuthenticated" class="mt-4 text-right">
        <UButton
          size="sm"
          variant="soft"
          color="primary"
          @click="refreshTeammatesInfo"
          :loading="isRefreshingTeammates"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" />
          </template>
          Actualizar información de equipos
        </UButton>
      </div>
    </div>

    <!-- Mensaje cuando no hay juegos publicados -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <div v-else-if="!filteredGames.length" class="text-center py-20">
      <UIcon
        name="i-heroicons-clock"
        class="h-24 w-24 mx-auto text-gray-400 mb-6"
      />
      <h2 class="text-2xl font-bold mb-3">Aún no hay juegos publicados</h2>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
        Los juegos de GameCraft2026 estarán disponibles próximamente. ¡Vuelve
        pronto para descubrir las leyendas convertidas en juegos!
      </p>
      <UButton to="/" color="primary" size="lg"> Volver al inicio </UButton>
    </div>

    <!-- Contenido de juegos -->
    <div v-else>
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Buscar por nombre -->
          <div class="space-y-2">
            <label
              for="search"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Buscar por nombre
            </label>
            <div class="relative mt-1">
              <input
                id="search"
                v-model="filters.search"
                type="text"
                placeholder="Buscar juego..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
              >
                <UIcon
                  name="i-heroicons-magnifying-glass"
                  class="h-5 w-5 text-gray-400"
                />
              </div>
            </div>
          </div>

          <!-- Categoría -->
          <div class="space-y-2">
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Categoría
            </label>
            <USelect
              id="category"
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="Todas las categorías"
              class="mt-1"
            />
          </div>

          <!-- Ordenar por -->
          <div class="space-y-2">
            <label
              for="sort"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Ordenar por
            </label>
            <USelect
              id="sort"
              v-model="filters.sort"
              :options="sortOptions"
              placeholder="Más recientes"
              class="mt-1"
            />
          </div>
        </div>
      </div>

      <!-- Mensaje cuando hay filtros aplicados pero no hay resultados -->
      <div
        v-if="searchApplied && !filteredGames.length"
        class="text-center py-16"
      >
        <UIcon
          name="i-heroicons-face-frown"
          class="h-16 w-16 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-xl font-semibold mb-2">No se encontraron juegos</h3>
        <p class="text-gray-600 dark:text-gray-400">
          No hay juegos que coincidan con los criterios de búsqueda.
        </p>
      </div>

      <!-- Listado de juegos -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="game in paginatedGames"
          :key="game._docId || game.id"
          class="group"
        >
          <UCard class="h-full flex flex-col">
            <!-- Imagen de cabecera -->
            <template #header>
              <div
                class="relative w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden"
              >
                <template v-if="game.gameImage">
                  <img
                    :src="game.gameImage"
                    :alt="displayGameTitle(game)"
                    class="w-full h-48 object-cover"
                  />
                </template>
                <template v-else>
                  <div
                    class="flex flex-col items-center justify-center w-full h-full text-gray-400"
                  >
                    <UIcon name="i-heroicons-photo" class="w-12 h-12 mb-2" />
                    <span class="text-sm">Imagen no disponible</span>
                  </div>
                </template>
              </div>
              <!-- Título y estado -->
              <div class="flex items-center justify-between mt-4 px-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ displayGameTitle(game) }}
                </h3>
                <UBadge
                  :color="statusBadgeColor(game.gameStatus)"
                  variant="soft"
                  class="ml-2 text-base"
                >
                  {{ getStatusLabel(game.gameStatus) }}
                </UBadge>
              </div>
              <!-- Autores -->
              <div
                class="px-4 mt-1 mb-2 text-sm text-gray-600 dark:text-gray-400"
              >
                Creado por:
                <span class="font-medium">{{
                  game.reservedBy || "Anónimo"
                }}</span>
                <template v-if="game.teammateName || game.teammateEmail">
                  y
                  <span class="font-medium">{{
                    game.teammateName ||
                    (game.teammateEmail
                      ? game.teammateEmail.split("@")[0]
                      : "") ||
                    game.teammateEmail
                  }}</span>
                </template>
              </div>
            </template>

            <!-- Descripción -->
            <div class="flex-1 px-4 pb-4">
              <p
                class="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 whitespace-pre-line"
              >
                {{ game.description }}
              </p>
              <div class="flex flex-wrap gap-2 mt-4">
                <UBadge
                  v-for="tag in game.tags?.slice(0, 3)"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>

            <!-- Botón grande Jugar -->
            <template #footer>
              <div class="flex flex-col items-center w-full px-4 pb-4">
                <UButton
                  color="primary"
                  size="lg"
                  block
                  :to="`/juegos/${game._docId || game.id}`"
                  class="font-bold text-lg py-3"
                >
                  Jugar
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <div class="flex space-x-2">
          <button
            @click="page = Math.max(1, page - 1)"
            :disabled="page === 1"
            :class="
              page === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            "
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          >
            Anterior
          </button>

          <button
            v-for="p in Math.min(5, totalPages)"
            :key="p"
            @click="page = p"
            :class="
              page === p
                ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            "
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium"
          >
            {{ p }}
          </button>

          <button
            @click="page = Math.min(totalPages, page + 1)"
            :disabled="page >= totalPages"
            :class="
              page >= totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            "
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useGames, displayGameTitle } from "~/composables/useGames";
import { useAuth } from "~/composables/useAuth";
import {
  normalizeGameStatus,
  GAME_STATUS,
  gameStatusLabel,
  gameStatusColor,
} from "~/composables/useGameStatus";

definePageMeta({
  title: "Juegos Participantes",
  description:
    "Videojuegos GameCraft2026 — torneo Unity con temáticas mitológicas",
});

// Estado de autenticación
const { isAuthenticated, user, waitForAuthInitialized } = useAuth();

// Cargar juegos usando el composable
const {
  games,
  loading: isLoading,
  error,
  fetchAllGames,
  updateTeammatesInfo,
  isRefreshingTeammates,
} = useGames();

// Datos de filtrado
const filters = reactive({
  search: "",
  category: null,
  sort: "recent",
});

const page = ref(1);
const pageSize = ref(9);

// Verificar si se está aplicando algún filtro de búsqueda
const searchApplied = computed(() => {
  return filters.search.trim() !== "" || filters.category !== null;
});

// Obtener opciones de categorías únicas desde los juegos
const categoryOptions = computed(() => {
  if (!games.value.length)
    return [{ label: "Todas las categorías", value: null }];

  const categories = new Set();
  games.value.forEach((game) => {
    if (game.tags && game.tags.length) {
      game.tags.forEach((tag) => categories.add(tag));
    }
  });

  const options = [{ label: "Todas las categorías", value: null }];
  categories.forEach((category) => {
    options.push({ label: category, value: category });
  });

  return options;
});

const sortOptions = [
  { label: "Más recientes", value: "recent" },
  { label: "Alfabético (A-Z)", value: "az" },
  { label: "Alfabético (Z-A)", value: "za" },
];

// Formatear fecha
const formatDate = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    // Si es timestamp de Firestore
    if (date && typeof date === "object" && date.seconds) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date.seconds * 1000));
    }

    // Si es un objeto Date
    if (date instanceof Date) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    // Si es string, intentar convertir
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
    console.error("[Juegos] Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

const getStatusLabel = (status) => gameStatusLabel(status);

const statusBadgeColor = (status) => gameStatusColor(status);

// Filtrar juegos según estado de autenticación y filtros aplicados
const filteredGames = computed(() => {
  if (!games.value.length) return [];

  // Filtrar primero por estado según el usuario esté autenticado o no
  let result = games.value.filter((game) => {
    const st = normalizeGameStatus(game.gameStatus);
    if (isAuthenticated.value) {
      return st === GAME_STATUS.PUBLICADO || st === GAME_STATUS.EN_DESARROLLO;
    }
    return st === GAME_STATUS.PUBLICADO;
  });

  // Aplicar filtro de búsqueda
  if (filters.search.trim()) {
    const searchLower = filters.search.toLowerCase().trim();
    result = result.filter((game) => {
      const title = displayGameTitle(game).toLowerCase();
      return (
        title.includes(searchLower) ||
        game.description?.toLowerCase().includes(searchLower) ||
        game.reservedBy?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Aplicar filtro de categoría
  if (filters.category) {
    result = result.filter(
      (game) => game.tags && game.tags.includes(filters.category)
    );
  }

  // Ordenar
  result.sort((a, b) => {
    switch (filters.sort) {
      case "recent":
        // Ordenar por fecha de reserva (más recientes primero)
        const dateA = a.reservedAt
          ? a.reservedAt.seconds
            ? a.reservedAt.seconds
            : new Date(a.reservedAt).getTime() / 1000
          : 0;
        const dateB = b.reservedAt
          ? b.reservedAt.seconds
            ? b.reservedAt.seconds
            : new Date(b.reservedAt).getTime() / 1000
          : 0;
        return dateB - dateA;
      case "az":
        return displayGameTitle(a).localeCompare(displayGameTitle(b));
      case "za":
        return displayGameTitle(b).localeCompare(displayGameTitle(a));
      default:
        return 0;
    }
  });

  return result;
});

// Paginación
const paginatedGames = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredGames.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredGames.value.length / pageSize.value) || 1;
});

// Resetear la página cuando cambian los filtros
watch(
  [() => filters.search, () => filters.category, () => filters.sort],
  () => {
    page.value = 1;
  }
);

// Cargar los juegos al montar el componente
onMounted(async () => {
  // Esperar a que se inicialice la autenticación
  await waitForAuthInitialized();

  // Cargar todos los juegos
  await fetchAllGames();

  // Actualizar información de compañeros para mostrar nombres en lugar de emails
  await updateTeammatesInfo();

  console.log(`[Juegos] Cargados ${games.value.length} juegos`);
  console.log(`[Juegos] Usuario autenticado: ${isAuthenticated.value}`);
});

// Función para actualizar información de compañeros
const refreshTeammatesInfo = async () => {
  console.log("[Juegos] Actualizando información de compañeros");
  try {
    await updateTeammatesInfo();
    console.log("[Juegos] Información de compañeros actualizada correctamente");
  } catch (error) {
    console.error(
      "[Juegos] Error al actualizar información de compañeros:",
      error
    );
  }
};
</script>
