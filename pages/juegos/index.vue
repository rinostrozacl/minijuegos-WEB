<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Juegos Participantes</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Explora los videojuegos creados para GameCraft2025 con temáticas
        chilenas.
      </p>
    </div>

    <!-- Mensaje cuando no hay juegos publicados -->
    <div v-if="!isShowGames" class="text-center py-20">
      <UIcon
        name="i-heroicons-clock"
        class="h-24 w-24 mx-auto text-gray-400 mb-6"
      />
      <h2 class="text-2xl font-bold mb-3">Aún no hay juegos publicados</h2>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
        Los juegos de la competencia GameCraft2025 estarán disponibles
        próximamente. ¡Vuelve pronto para descubrir increíbles creaciones con
        temáticas chilenas!
      </p>
      <UButton to="/" color="primary" size="lg"> Volver al inicio </UButton>
    </div>

    <!-- Contenido de juegos (solo se muestra si isShowGames es true) -->
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

          <!-- Temática -->
          <div class="space-y-2">
            <label
              for="theme"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Temática
            </label>
            <USelect
              id="theme"
              v-model="filters.theme"
              :options="themeOptions"
              placeholder="Todas las temáticas"
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

      <!-- Listado de juegos -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin h-12 w-12 text-primary"
        />
      </div>

      <div v-else-if="filteredGames.length === 0" class="text-center py-16">
        <UIcon
          name="i-heroicons-face-frown"
          class="h-16 w-16 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-xl font-semibold mb-2">No se encontraron juegos</h3>
        <p class="text-gray-600 dark:text-gray-400">
          No hay juegos que coincidan con los criterios de búsqueda.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="game in filteredGames" :key="game.id" class="group">
          <NuxtLink :to="`/juegos/${game.id}`" class="block h-full">
            <UCard
              class="h-full hover:shadow-lg transition-shadow duration-300"
            >
              <template #header>
                <div class="relative">
                  <img
                    :src="game.coverImage"
                    :alt="game.title"
                    class="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-4"
                  >
                    <h3 class="text-white text-xl font-bold">
                      {{ game.title }}
                    </h3>
                  </div>
                </div>
              </template>

              <div class="space-y-4">
                <div
                  class="flex items-center text-sm text-gray-600 dark:text-gray-400"
                >
                  <UIcon name="i-heroicons-user" class="mr-2" />
                  <span>{{ game.author }}</span>
                </div>

                <p class="text-gray-700 dark:text-gray-300 line-clamp-3">
                  {{ game.description }}
                </p>

                <div class="flex flex-wrap gap-2">
                  <UBadge color="primary" variant="subtle">{{
                    game.theme
                  }}</UBadge>
                  <UBadge v-if="game.rating" color="yellow" variant="subtle">
                    <template #leading>
                      <UIcon name="i-heroicons-star" />
                    </template>
                    {{ game.rating.toFixed(1) }}
                  </UBadge>
                </div>
              </div>

              <template #footer>
                <UButton color="primary" variant="ghost" class="w-full">
                  Ver juego
                </UButton>
              </template>
            </UCard>
          </NuxtLink>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="filteredGames.length > 0" class="mt-8 flex justify-center">
        <UPagination
          v-model="currentPage"
          :page-count="totalPages"
          :total="totalGames"
          :ui="{ rounded: 'rounded-full' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Juegos Participantes",
  description:
    "Explora los videojuegos creados para GameCraft2025, la competencia universitaria de desarrollo de videojuegos con temáticas chilenas",
});

// Datos de filtrado
const filters = reactive({
  search: "",
  theme: null,
  sort: "recent",
});

// Opciones para los selectores
const themeOptions = [
  { label: "Todas las temáticas", value: null },
  { label: "Pudú Aventurero", value: "pudu" },
  { label: "Terremoto Chileno", value: "terremoto" },
  { label: "Cóndor de los Andes", value: "condor" },
  { label: "Minería en Chile", value: "mineria" },
  { label: "Fiestas Patrias", value: "fiestas" },
];

const sortOptions = [
  { label: "Más recientes", value: "recent" },
  { label: "Mejor calificados", value: "rating" },
  { label: "Alfabético (A-Z)", value: "az" },
  { label: "Alfabético (Z-A)", value: "za" },
];

// Estado
const isShowGames = ref(false);
const isLoading = ref(true);
const currentPage = ref(1);
const gamesPerPage = 9;
const totalGames = ref(0);

// Juegos de ejemplo (esto se reemplazará con datos de Firebase)
const mockGames = [
  {
    id: "1",
    title: "Pudú Aventurero",
    description:
      "Ayuda a Pudín el pudú a recorrer los bosques del sur de Chile, esquivando peligros y recogiendo frutos nativos.",
    author: "Juan Pérez",
    theme: "pudu",
    coverImage: "https://placehold.co/600x400?text=Pudu+Aventurero",
    rating: 4.5,
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "2",
    title: "Terremoto 8.8",
    description:
      "Un juego de supervivencia donde debes ayudar a los habitantes a prepararse y responder ante un gran terremoto en la costa chilena.",
    author: "María González",
    theme: "terremoto",
    coverImage: "https://placehold.co/600x400?text=Terremoto+8.8",
    rating: 4.2,
    createdAt: new Date("2023-11-10"),
  },
  {
    id: "3",
    title: "Vuelo del Cóndor",
    description:
      "Controla a un majestuoso cóndor mientras sobrevuela la cordillera de los Andes, evitando tormentas y cazadores.",
    author: "Pedro Martínez y Ana Vega",
    theme: "condor",
    coverImage: "https://placehold.co/600x400?text=Vuelo+del+Condor",
    rating: 3.9,
    createdAt: new Date("2023-11-05"),
  },
  {
    id: "4",
    title: "El Chiflón del Diablo",
    description:
      "Adéntrate en las históricas minas de carbón de Lota y descubre los secretos y leyendas que esconden sus túneles.",
    author: "Javier Silva",
    theme: "mineria",
    coverImage: "https://placehold.co/600x400?text=Chiflon+del+Diablo",
    rating: 4.7,
    createdAt: new Date("2023-10-30"),
  },
  {
    id: "5",
    title: "Ramadas Locas",
    description:
      "Administra tu propia ramada durante las Fiestas Patrias, prepara comidas típicas y mantén felices a tus clientes.",
    author: "Carolina Muñoz",
    theme: "fiestas",
    coverImage: "https://placehold.co/600x400?text=Ramadas+Locas",
    rating: 4.0,
    createdAt: new Date("2023-10-25"),
  },
  {
    id: "6",
    title: "Mina de Oro",
    description:
      "Excava en las profundidades de una mina chilena en busca de oro y otros minerales, mientras gestionas tus recursos.",
    author: "Roberto Díaz y Patricia López",
    theme: "mineria",
    coverImage: "https://placehold.co/600x400?text=Mina+de+Oro",
    rating: 3.7,
    createdAt: new Date("2023-10-20"),
  },
];

// Simulamos la carga de datos
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
    totalGames.value = mockGames.length;
  }, 1000);
});

// Filtramos y ordenamos los juegos
const filteredGames = computed(() => {
  let result = [...mockGames];

  // Filtrar por búsqueda
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (game) =>
        game.title.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower)
    );
  }

  // Filtrar por temática
  if (filters.theme) {
    result = result.filter((game) => game.theme === filters.theme);
  }

  // Ordenar
  result.sort((a, b) => {
    switch (filters.sort) {
      case "recent":
        return b.createdAt - a.createdAt;
      case "rating":
        return b.rating - a.rating;
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Paginación
  const start = (currentPage.value - 1) * gamesPerPage;
  const end = start + gamesPerPage;
  return result.slice(start, end);
});

// Cálculo del total de filteredGames sin paginación para totalizar
const totalFilteredGames = computed(() => {
  let result = [...mockGames];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (game) =>
        game.title.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower)
    );
  }

  if (filters.theme) {
    result = result.filter((game) => game.theme === filters.theme);
  }

  return result.length;
});

// Actualizar el total cuando cambien los filtros
watch([() => filters.search, () => filters.theme], () => {
  totalGames.value = totalFilteredGames.value;
});

// Cálculo del total de páginas
const totalPages = computed(() => {
  return Math.ceil(totalGames.value / gamesPerPage);
});

// Resetear la página cuando cambian los filtros
watch([() => filters.search, () => filters.theme, () => filters.sort], () => {
  currentPage.value = 1;
});
</script>
