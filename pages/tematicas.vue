<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Estado de carga para verificación de autenticación -->
    <div v-if="isAuthChecking" class="flex justify-center items-center py-16">
      <div class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin h-12 w-12 text-primary mx-auto mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
      </div>
    </div>

    <div v-else>
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
              placeholder="Buscar temáticas..."
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
                  <div class="relative">
                    <img
                      :src="
                        theme.image ||
                        `https://placehold.co/800x400?text=${encodeURIComponent(
                          theme.title
                        )}`
                      "
                      :alt="theme.title"
                      class="w-full h-48 object-cover rounded-t-lg"
                    />

                    <UBadge
                      :color="theme.available ? 'green' : 'gray'"
                      class="absolute top-3 right-3"
                      :ui="{ rounded: 'rounded-full' }"
                    >
                      {{ theme.available ? "Disponible" : "Reservada" }}
                    </UBadge>

                    <div
                      class="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-4"
                    >
                      <h3 class="text-white text-xl font-bold">
                        {{ theme.title }}
                      </h3>
                    </div>
                  </div>
                </template>

                <div class="grow flex flex-col">
                  <p class="text-gray-700 dark:text-gray-300 mb-4">
                    {{ theme.description }}
                  </p>

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
                      v-else
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
              <div class="relative">
                <img
                  :src="
                    theme.image ||
                    `https://placehold.co/800x400?text=${encodeURIComponent(
                      theme.title
                    )}`
                  "
                  :alt="theme.title"
                  class="w-full h-48 object-cover rounded-t-lg"
                />

                <UBadge
                  :color="theme.available ? 'green' : 'gray'"
                  class="absolute top-3 right-3"
                  :ui="{ rounded: 'rounded-full' }"
                >
                  {{ theme.available ? "Disponible" : "Reservada" }}
                </UBadge>

                <div
                  class="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-4"
                >
                  <h3 class="text-white text-xl font-bold">
                    {{ theme.title }}
                  </h3>
                </div>
              </div>
            </template>

            <div class="grow flex flex-col">
              <p class="text-gray-700 dark:text-gray-300 mb-4">
                {{ theme.description }}
              </p>

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
                  v-else
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

      <!-- Modal de confirmación de reserva -->
      <UModal v-model="showReservationModal">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Confirmar reserva</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="-my-1"
                @click="showReservationModal = false"
              />
            </div>
          </template>

          <p class="mb-4">
            ¿Estás seguro que deseas reservar la temática
            <strong>"{{ selectedTheme?.title || "seleccionada" }}"</strong>?
          </p>

          <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Una vez confirmada, la temática quedará asignada a tu cuenta y no
            podrás cambiarla.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="gray"
                variant="solid"
                @click="showReservationModal = false"
              >
                Cancelar
              </UButton>
              <UButton
                color="primary"
                :loading="isSubmitting"
                @click="confirmReservation"
              >
                Confirmar reserva
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { where } from "firebase/firestore";
import { Theme } from "../composables/useThemes";

// Definición de metadatos para SEO
definePageMeta({
  title: "Temáticas",
  description:
    "Explora las temáticas chilenas disponibles para la competencia GameCraft2025",
  middleware: ["auth"],
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

// Verificar si estamos en ruta protegida y usuario autenticado
const isAuthChecking = ref(true);

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
  console.log(
    "[Tematicas] Montando página de temáticas, iniciando verificación de autenticación"
  );

  try {
    isLoading.value = true;
    isAuthChecking.value = true;

    // Esperar a que la autenticación esté inicializada
    await waitForAuthInitialized();

    // Verificar estado de autenticación
    console.log(
      "[Tematicas] Estado de autenticación después de inicializar:",
      isLoggedIn.value ? `Autenticado: ${user.value?.email}` : "No autenticado"
    );

    // Solo cargar temáticas si el usuario está autenticado
    if (isLoggedIn.value) {
      console.log("[Tematicas] Usuario autenticado, cargando temáticas");
      await fetchAllThemes();
    } else {
      console.warn("[Tematicas] Usuario no autenticado, se redirigirá");
      // La redirección la manejará el middleware
    }
  } catch (err) {
    console.error("[Tematicas] Error en la carga inicial:", err);
    toast.add({
      title: "Error",
      description: "Ha ocurrido un error al cargar la página",
      color: "red",
    });
  } finally {
    isAuthChecking.value = false;
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
          theme.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }

  // Filtrar por categoría seleccionada
  if (selectedCategory.value) {
    result = result.filter(
      (theme) => theme.tags && theme.tags.includes(selectedCategory.value)
    );
  }

  return result;
});

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

  return groups;
});

// Obtener la temática seleccionada
const selectedTheme = computed(() => {
  if (!selectedThemeId.value) return null;
  return themes.value.find((theme) => theme.id === selectedThemeId.value);
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
  selectedThemeId.value = themeId;
  showReservationModal.value = true;
};

// Confirmar reserva
const confirmReservation = async () => {
  if (!selectedThemeId.value || !isLoggedIn.value) return;

  try {
    isSubmitting.value = true;

    // Obtener información del usuario
    const userId = user.value?.uid || "";
    const userName = user.value?.displayName || user.value?.email || "Usuario";

    // Llamar a la función de reserva del composable
    const result = await reserveThemeInFirebase(
      selectedThemeId.value,
      userId,
      userName
    );

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
