<template>
  <div class="container mx-auto px-4 py-8">
    <div>
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Temáticas Chilenas</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Explora las temáticas disponibles para la competencia de minijuegos.
          Cada temática representa aspectos culturales, históricos o naturales
          de Chile.
        </p>
      </div>

      <!-- Barra de búsqueda y filtros -->
      <div class="max-w-4xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <!-- Búsqueda -->
          <div class="flex-grow">
            <UInput
              v-model="searchQuery"
              placeholder="Buscar por título, descripción o número..."
              icon="i-heroicons-magnifying-glass"
              class="w-full"
              @input="debounceSearch"
            />
          </div>

          <!-- Filtro por categoría -->
          <div class="md:w-64">
            <USelectMenu
              v-model="selectedCategory"
              :options="categories"
              placeholder="Todas las categorías"
              option-attribute="text"
            />
          </div>
        </div>

        <!-- Filtro por estado -->
        <div class="flex justify-center">
          <UButtonGroup size="lg">
            <UButton
              @click="selectedFilter = 'all'"
              :color="selectedFilter === 'all' ? 'primary' : 'gray'"
              :variant="selectedFilter === 'all' ? 'solid' : 'ghost'"
            >
              Todas
            </UButton>
            <UButton
              @click="selectedFilter = 'available'"
              :color="selectedFilter === 'available' ? 'primary' : 'gray'"
              :variant="selectedFilter === 'available' ? 'solid' : 'ghost'"
            >
              Disponibles
            </UButton>
            <UButton
              @click="selectedFilter = 'reserved'"
              :color="selectedFilter === 'reserved' ? 'primary' : 'gray'"
              :variant="selectedFilter === 'reserved' ? 'solid' : 'ghost'"
            >
              Reservadas
            </UButton>
          </UButtonGroup>
        </div>
      </div>

      <!-- Listado de temáticas -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin h-12 w-12 text-primary"
        />
      </div>

      <div v-else-if="filteredThemes.length === 0" class="text-center py-16">
        <UIcon
          name="i-heroicons-face-frown"
          class="h-16 w-16 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-xl font-semibold mb-2">No hay temáticas disponibles</h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{
            searchQuery
              ? "No hay resultados para tu búsqueda. Intenta con otros términos."
              : "No hay temáticas que coincidan con los filtros seleccionados."
          }}
        </p>
      </div>

      <!-- Grid de temáticas -->
      <div v-else>
        <!-- Agrupación por categorías cuando no hay búsqueda activa -->
        <div v-if="!searchQuery && selectedCategory === null">
          <div
            v-for="(group, category) in groupedThemes"
            :key="category"
            class="mb-12"
          >
            <h2
              class="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700"
            >
              {{ category }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <UCard
                v-for="theme in group"
                :key="theme.id"
                :ui="{
                  ring: '',
                  divide: 'divide-y divide-gray-100 dark:divide-gray-800',
                  body: { base: 'h-full flex flex-col' },
                }"
                class="h-full transform transition-transform duration-200 hover:scale-[1.02]"
                :class="{
                  'ring-2 ring-primary/50': theme.available,
                  'ring-2 ring-gray-300 dark:ring-gray-700': !theme.available,
                }"
              >
                <template #header>
                  <div class="relative bg-primary/10 rounded-t-lg py-4">
                    <div class="flex items-center px-4">
                      <div class="flex items-center">
                        <div
                          class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-3 shadow-md border-2 border-white dark:border-gray-800"
                        >
                          {{ getThemeNumber(theme.id) }}
                        </div>
                        <h3 class="text-base font-bold">
                          {{ theme.title }}
                        </h3>
                      </div>
                    </div>
                  </div>
                </template>

                <div class="grow flex flex-col">
                  <div class="mt-auto">
                    <div
                      v-if="theme.tags && theme.tags.length > 0"
                      class="flex flex-wrap gap-2 mb-4"
                    >
                      <UBadge
                        v-for="tag in theme.tags"
                        :key="tag"
                        color="primary"
                        variant="subtle"
                      >
                        {{ tag }}
                      </UBadge>
                    </div>

                    <!-- Botón para reservar -->
                    <UButton
                      v-if="theme.available && isLoggedIn"
                      color="primary"
                      block
                      @click="() => reserveTheme(theme.id)"
                    >
                      Reservar temática
                    </UButton>

                    <UButton
                      v-else-if="theme.available && !isLoggedIn"
                      to="/ingresar"
                      color="primary"
                      block
                    >
                      Iniciar sesión para reservar
                    </UButton>

                    <div
                      v-else-if="!theme.available"
                      class="text-gray-500 dark:text-gray-400 text-sm pt-2"
                    >
                      <div class="flex items-center">
                        <UIcon name="i-heroicons-user" class="mr-2 w-4 h-4" />
                        <span
                          >Reservada por:
                          {{ theme.reservedBy || "Usuario" }}</span
                        >
                      </div>
                      <div class="flex items-center mt-1">
                        <UIcon name="i-heroicons-clock" class="mr-2 w-4 h-4" />
                        <span>{{ formatDate(theme.reservedAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>

        <!-- Lista plana para resultados de búsqueda o filtrado por categoría -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <UCard
            v-for="theme in filteredThemes"
            :key="theme.id"
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
              body: { base: 'h-full flex flex-col' },
            }"
            class="h-full transform transition-transform duration-200 hover:scale-[1.02]"
            :class="{
              'ring-2 ring-primary/50': theme.available,
              'ring-2 ring-gray-300 dark:ring-gray-700': !theme.available,
            }"
          >
            <template #header>
              <div class="relative bg-primary/10 rounded-t-lg py-4">
                <div class="flex items-center px-4">
                  <div class="flex items-center">
                    <div
                      class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-3 shadow-md border-2 border-white dark:border-gray-800"
                    >
                      {{ getThemeNumber(theme.id) }}
                    </div>
                    <h3 class="text-base font-bold">
                      {{ theme.title }}
                    </h3>
                  </div>
                </div>
              </div>
            </template>

            <div class="grow flex flex-col">
              <div class="mt-auto">
                <div
                  v-if="theme.tags && theme.tags.length > 0"
                  class="flex flex-wrap gap-2 mb-4"
                >
                  <UBadge
                    v-for="tag in theme.tags"
                    :key="tag"
                    color="primary"
                    variant="subtle"
                  >
                    {{ tag }}
                  </UBadge>
                </div>

                <!-- Botón para reservar -->
                <UButton
                  v-if="theme.available && isLoggedIn"
                  color="primary"
                  block
                  @click="() => reserveTheme(theme.id)"
                >
                  Reservar temática
                </UButton>

                <UButton
                  v-else-if="theme.available && !isLoggedIn"
                  to="/ingresar"
                  color="primary"
                  block
                >
                  Iniciar sesión para reservar
                </UButton>

                <div
                  v-else-if="!theme.available"
                  class="text-gray-500 dark:text-gray-400 text-sm pt-2"
                >
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-user" class="mr-2 w-4 h-4" />
                    <span
                      >Reservada por: {{ theme.reservedBy || "Usuario" }}</span
                    >
                  </div>
                  <div class="flex items-center mt-1">
                    <UIcon name="i-heroicons-clock" class="mr-2 w-4 h-4" />
                    <span>{{ formatDate(theme.reservedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal personalizado básico -->
  <Teleport to="body">
    <div
      v-if="showReservationModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="showReservationModal = false"
      ></div>

      <!-- Modal content -->
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div
          class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
        >
          <!-- Header -->
          <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold">Confirmar reserva</h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ selectedTheme?.title || "Temática seleccionada" }}
                </p>
              </div>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
                @click="showReservationModal = false"
              >
                <span class="sr-only">Cerrar</span>
                <svg
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Contenido -->
            <div class="mt-4">
              <div
                class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4"
              >
                <p class="text-gray-800 dark:text-gray-200">
                  {{
                    selectedTheme?.description || "Sin descripción disponible"
                  }}
                </p>
              </div>

              <div class="mt-6 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-primary mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  ¿Estás seguro que deseas reservar esta temática? Una vez
                  confirmada, quedará asignada a tu cuenta y no podrás
                  cambiarla.
                </p>
              </div>

              <!-- Texto de vinculación de cuenta -->
              <div
                class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <p
                  class="text-gray-600 dark:text-gray-400 text-sm text-center font-medium"
                >
                  Este juego quedará vinculado a la cuenta "{{
                    user?.email || "Usuario"
                  }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Footer con botones -->
          <div
            class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
          >
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:ml-3 sm:w-auto"
              :disabled="isSubmitting"
              @click="confirmReservation"
            >
              <svg
                v-if="isSubmitting"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Confirmar reserva
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
              @click="showReservationModal = false"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { where } from "firebase/firestore";

// Definición de metadatos para SEO
definePageMeta({
  title: "Temáticas",
  description:
    "Explora las temáticas chilenas disponibles para la competencia GameCraft2025",
});

// Estado
const isLoading = ref(true);
const selectedFilter = ref("all");
const showReservationModal = ref(false);
const isSubmitting = ref(false);
const selectedThemeId = ref(null);
const searchQuery = ref("");
const selectedCategory = ref(null);

// Para debounce de búsqueda
let searchTimeout = null;

// Categorías disponibles
const categories = [
  { value: null, text: "Todas las categorías" },
  { value: "Fauna", text: "Fauna" },
  { value: "Flora", text: "Flora" },
  { value: "Mitología", text: "Mitología" },
  { value: "Pueblos Originarios", text: "Pueblos Originarios" },
  { value: "Geografía", text: "Geografía" },
  { value: "Gastronomía", text: "Gastronomía" },
  { value: "Tradiciones", text: "Tradiciones" },
];

// Acceder al estado de autenticación
const { isAuthenticated: isLoggedIn, user, waitForAuthInitialized } = useAuth();

// Toast para notificaciones
const toast = useToast();

// Usar el composable de temas
const {
  themes,
  loading,
  error,
  isLoading: isLoadingThemes,
  fetchAllThemes,
  fetchAvailableThemes,
  fetchReservedThemes,
  reserveTheme: reserveThemeInFirebase,
} = useThemes();

// Debounce para búsqueda
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // La búsqueda se actualiza automáticamente con el binding de filteredThemes
  }, 300);
};

// Actualizar datos cuando cambia el filtro
watch(selectedFilter, async (newFilter) => {
  isLoading.value = true;
  try {
    if (newFilter === "all") {
      await fetchAllThemes();
    } else if (newFilter === "available") {
      await fetchAvailableThemes();
    } else if (newFilter === "reserved") {
      await fetchReservedThemes();
    }
  } catch (err) {
    console.error("Error al cargar las temáticas filtradas:", err);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar las temáticas",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
});

// Cargar las temáticas al montar el componente
onMounted(async () => {
  console.log("[Tematicas] Montando página de temáticas");

  try {
    isLoading.value = true;

    // Cargar temáticas inmediatamente sin esperar autenticación
    console.log("[Tematicas] Cargando temáticas");
    await fetchAllThemes();
  } catch (err) {
    console.error("[Tematicas] Error en la carga inicial:", err);
    toast.add({
      title: "Error",
      description: "Ha ocurrido un error al cargar la página",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
});

// Filtrar temáticas según búsqueda, categoría y disponibilidad
const filteredThemes = computed(() => {
  let result = themes.value;

  // Filtrar por búsqueda si hay texto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (theme) =>
        theme.title.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query) ||
        (theme.tags &&
          theme.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        getThemeNumber(theme.id).includes(query) // Buscar por número
    );
  }

  // Filtrar por categoría seleccionada
  if (selectedCategory.value) {
    result = result.filter(
      (theme) => theme.tags && theme.tags.includes(selectedCategory.value)
    );
  }

  // Ordenar temas por número (extraído del ID)
  return result.sort((a, b) => {
    // Asegurar que estamos trabajando con strings
    const idA = String(a.id);
    const idB = String(b.id);
    const numA = parseInt(idA.replace(/\D/g, "") || "0", 10);
    const numB = parseInt(idB.replace(/\D/g, "") || "0", 10);
    return numA - numB;
  });
});

// Función para extraer el número de la temática del ID
const getThemeNumber = (id) => {
  if (!id) return "N";
  // Asegurar que estamos trabajando con string
  const idStr = String(id);
  const numStr = idStr.replace(/\D/g, "");
  return numStr || "N";
};

// Agrupar temáticas por categoría para visualización
const groupedThemes = computed(() => {
  const groups = {};

  // Función auxiliar para determinar la categoría principal de una temática
  const getPrimaryCategory = (theme) => {
    if (!theme.tags || theme.tags.length === 0) return "Sin categoría";

    // Priorizar categorías según el orden definido
    for (const category of categories) {
      if (category.value && theme.tags.includes(category.value)) {
        return category.value;
      }
    }

    return theme.tags[0]; // Si no coincide con ninguna categoría predefinida, usar la primera
  };

  // Agrupar temáticas por su categoría principal
  for (const theme of filteredThemes.value) {
    const category = getPrimaryCategory(theme);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(theme);
  }

  // Ordenar los temas dentro de cada grupo
  for (const category in groups) {
    groups[category].sort((a, b) => {
      // Asegurar que estamos trabajando con strings
      const idA = String(a.id);
      const idB = String(b.id);
      const numA = parseInt(idA.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(idB.replace(/\D/g, "") || "0", 10);
      return numA - numB;
    });
  }

  return groups;
});

// Obtener la temática seleccionada
const selectedTheme = computed(() => {
  if (!selectedThemeId.value) return null;
  // Asegurar comparación consistente de IDs
  const themeId = String(selectedThemeId.value);
  return themes.value.find((theme) => String(theme.id) === themeId);
});

// Formatear fecha
const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Iniciar proceso de reserva
const reserveTheme = (themeId) => {
  console.log("[Tematicas] Iniciando reserva de temática:", {
    idOriginal: themeId,
    tipo: typeof themeId,
  });

  // Asegurar que el ID es string
  selectedThemeId.value = String(themeId);

  // Buscar el tema en el arreglo local para verificar
  const temaEncontrado = themes.value.find(
    (t) => String(t.id) === selectedThemeId.value
  );
  console.log(
    "[Tematicas] Tema encontrado en arreglo local:",
    temaEncontrado
      ? {
          id: temaEncontrado.id,
          titulo: temaEncontrado.title,
        }
      : "No encontrado"
  );

  showReservationModal.value = true;
  console.log("[Tematicas] Estado del modal:", showReservationModal.value);
};

// Confirmar reserva
const confirmReservation = async () => {
  if (!selectedThemeId.value || !isLoggedIn.value) return;

  try {
    isSubmitting.value = true;

    // Obtener información del usuario
    const userId = user.value?.uid || "";
    const userName = user.value?.displayName || user.value?.email || "Usuario";

    // Asegurar que el ID es string
    const themeId = String(selectedThemeId.value);

    // Llamar a la función de reserva del composable
    const result = await reserveThemeInFirebase(themeId, userId, userName);

    if (!result.success) {
      throw new Error(result.error || "Error al reservar la temática");
    }

    // Cerrar modal
    showReservationModal.value = false;
    selectedThemeId.value = null;

    // Mostrar notificación de éxito con Toast
    toast.add({
      title: "¡Éxito!",
      description: `La temática "${selectedTheme.value?.title}" ha sido reservada correctamente.`,
      color: "green",
      timeout: 5000,
    });
  } catch (error) {
    console.error("Error al reservar temática:", error);
    toast.add({
      title: "Error",
      description: "No se pudo reservar la temática. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
