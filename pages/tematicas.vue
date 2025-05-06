<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-4">Temáticas Chilenas</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        Explora las temáticas disponibles para la competencia de minijuegos.
        Cada temática representa aspectos culturales, históricos o naturales de
        Chile.
      </p>
    </div>

    <!-- Filtro por estado -->
    <div class="flex justify-center mb-8">
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
        No hay temáticas que coincidan con el filtro seleccionado.
      </p>
    </div>

    <!-- Grid de temáticas -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="theme in filteredThemes"
        :key="theme.id"
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: { base: 'h-full flex flex-col' },
        }"
        class="h-full"
        :class="{
          'ring-2 ring-primary/50': !theme.reserved,
          'ring-2 ring-gray-300 dark:ring-gray-700': theme.reserved,
        }"
      >
        <template #header>
          <div class="relative">
            <img
              :src="theme.image"
              :alt="theme.name"
              class="w-full h-48 object-cover rounded-t-lg"
            />

            <UBadge
              :color="theme.reserved ? 'gray' : 'green'"
              class="absolute top-3 right-3"
              :ui="{ rounded: 'rounded-full' }"
            >
              {{ theme.reserved ? "Reservada" : "Disponible" }}
            </UBadge>

            <div
              class="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-4"
            >
              <h3 class="text-white text-xl font-bold">{{ theme.name }}</h3>
            </div>
          </div>
        </template>

        <div class="grow flex flex-col">
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            {{ theme.description }}
          </p>

          <div class="mt-auto">
            <div class="flex flex-wrap gap-2 mb-4">
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
              v-if="!theme.reserved && isLoggedIn"
              color="primary"
              block
              @click="() => reserveTheme(theme.id)"
            >
              Reservar temática
            </UButton>

            <UButton
              v-else-if="!theme.reserved && !isLoggedIn"
              to="/ingresar"
              color="primary"
              block
            >
              Iniciar sesión para reservar
            </UButton>

            <div v-else class="text-gray-500 dark:text-gray-400 text-sm pt-2">
              <div class="flex items-center">
                <UIcon name="i-heroicons-user" class="mr-2 w-4 h-4" />
                <span>Reservada por: {{ theme.reservedBy || "Usuario" }}</span>
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
          <strong>"{{ selectedTheme?.name || "seleccionada" }}"</strong>?
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Definición de metadatos para SEO
definePageMeta({
  title: "Temáticas Chilenas",
  description:
    "Explora las temáticas disponibles para la competencia de minijuegos",
});

// Estado
const isLoading = ref(true);
const selectedFilter = ref("all");
const showReservationModal = ref(false);
const isSubmitting = ref(false);
const selectedThemeId = ref(null);

// Simulación de estado de autenticación (se reemplazará con Firebase Auth)
const isLoggedIn = ref(false);

// Datos de ejemplo (se reemplazarán con datos de Firebase)
const themes = ref([
  {
    id: "1",
    name: "Pudú Aventurero",
    description:
      "Crea un juego protagonizado por el pudú, uno de los ciervos más pequeños del mundo y nativo de los bosques del sur de Chile.",
    image: "https://placehold.co/800x400?text=Pudu+Aventurero",
    tags: ["Fauna nativa", "Conservación", "Bosques"],
    reserved: true,
    reservedBy: "Juan Pérez",
    reservedAt: new Date("2023-10-15"),
  },
  {
    id: "2",
    name: "Terremoto Chileno",
    description:
      "Desarrolla un juego basado en los terremotos que afectan a Chile, promoviendo la educación sobre prevención y respuesta ante este fenómeno natural.",
    image: "https://placehold.co/800x400?text=Terremoto+Chileno",
    tags: ["Desastres naturales", "Educativo", "Supervivencia"],
    reserved: true,
    reservedBy: "María González",
    reservedAt: new Date("2023-10-18"),
  },
  {
    id: "3",
    name: "Cóndor de los Andes",
    description:
      "Crea un juego donde el jugador controla un cóndor (ave nacional de Chile) que sobrevuela la cordillera de los Andes.",
    image: "https://placehold.co/800x400?text=Condor+Andino",
    tags: ["Fauna nativa", "Cordillera", "Aventura"],
    reserved: true,
    reservedBy: "Pedro Martínez y Ana Vega",
    reservedAt: new Date("2023-10-20"),
  },
  {
    id: "4",
    name: "Minería en Chile",
    description:
      "Desarrolla un juego sobre la minería, una de las principales actividades económicas de Chile, explorando su historia y relevancia.",
    image: "https://placehold.co/800x400?text=Mineria+Chilena",
    tags: ["Historia", "Economía", "Recursos naturales"],
    reserved: true,
    reservedBy: "Javier Silva",
    reservedAt: new Date("2023-10-22"),
  },
  {
    id: "5",
    name: "Fiestas Patrias",
    description:
      "Crea un juego ambientado en las Fiestas Patrias de Chile, incluyendo tradiciones como fondas, juegos típicos y gastronomía.",
    image: "https://placehold.co/800x400?text=Fiestas+Patrias",
    tags: ["Tradiciones", "Cultura", "Celebración"],
    reserved: true,
    reservedBy: "Carolina Muñoz",
    reservedAt: new Date("2023-10-25"),
  },
  {
    id: "6",
    name: "Isla de Pascua",
    description:
      "Desarrolla un juego basado en la historia y misterios de la Isla de Pascua (Rapa Nui) y sus emblemáticos moáis.",
    image: "https://placehold.co/800x400?text=Isla+de+Pascua",
    tags: ["Cultura", "Historia", "Arqueología"],
    reserved: false,
  },
  {
    id: "7",
    name: "Leyendas Mapuche",
    description:
      "Crea un juego inspirado en la rica tradición oral del pueblo Mapuche, sus mitos y leyendas.",
    image: "https://placehold.co/800x400?text=Leyendas+Mapuche",
    tags: ["Pueblos originarios", "Mitología", "Cultura"],
    reserved: false,
  },
  {
    id: "8",
    name: "Astronomía en Chile",
    description:
      "Desarrolla un juego relacionado con la astronomía en Chile, aprovechando que el país alberga algunos de los observatorios más importantes del mundo.",
    image: "https://placehold.co/800x400?text=Astronomia+Chile",
    tags: ["Ciencia", "Exploración", "Espacio"],
    reserved: false,
  },
  {
    id: "9",
    name: "Torres del Paine",
    description:
      "Crea un juego de aventura o exploración ambientado en el Parque Nacional Torres del Paine, uno de los destinos más emblemáticos de la Patagonia chilena.",
    image: "https://placehold.co/800x400?text=Torres+del+Paine",
    tags: ["Naturaleza", "Parques nacionales", "Patagonia"],
    reserved: false,
  },
]);

// Simulamos la carga de datos
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});

// Filtrar temáticas según el filtro seleccionado
const filteredThemes = computed(() => {
  if (selectedFilter.value === "all") {
    return themes.value;
  } else if (selectedFilter.value === "available") {
    return themes.value.filter((theme) => !theme.reserved);
  } else {
    return themes.value.filter((theme) => theme.reserved);
  }
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
  if (!selectedThemeId.value) return;

  try {
    isSubmitting.value = true;

    // Simulamos la reserva (esto se reemplazará con Firebase)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Actualizar el estado local
    const themeIndex = themes.value.findIndex(
      (theme) => theme.id === selectedThemeId.value
    );
    if (themeIndex !== -1) {
      themes.value[themeIndex] = {
        ...themes.value[themeIndex],
        reserved: true,
        reservedBy: "Usuario Actual", // Se reemplazará con datos reales del usuario
        reservedAt: new Date(),
      };
    }

    // Cerrar modal
    showReservationModal.value = false;
    selectedThemeId.value = null;

    // Mostrar mensaje de éxito
    alert("¡Temática reservada con éxito!");
  } catch (error) {
    console.error("Error al reservar temática:", error);
    alert(
      "Hubo un error al reservar la temática. Por favor, intenta nuevamente."
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
