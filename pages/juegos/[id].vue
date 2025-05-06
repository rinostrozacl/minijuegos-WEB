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

            <!-- Área del juego (simulación con un iframe) -->
            <div
              v-if="activeTab === 'game'"
              class="bg-gray-900 aspect-video rounded-lg overflow-hidden flex items-center justify-center"
            >
              <!-- Esto será reemplazado por la carga del juego WebGL -->
              <div class="text-center">
                <UIcon
                  name="i-heroicons-play-circle"
                  class="h-16 w-16 text-white mb-4"
                />
                <p class="text-white">Cargando juego WebGL...</p>
                <p class="text-sm text-gray-400 mt-2">
                  (Esta es una simulación. El juego real se cargará desde
                  Firebase)
                </p>
              </div>
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

          <!-- Evaluación -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Evaluación</h2>
              <UBadge v-if="game.rating" color="yellow" size="lg">
                <template #leading>
                  <UIcon name="i-heroicons-star" />
                </template>
                {{ game.rating.toFixed(1) }}
              </UBadge>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <span>Gráficos</span>
                  <span class="font-semibold"
                    >{{ game.ratings?.graphics || 4 }}/5</span
                  >
                </div>
                <UProgress
                  :value="(game.ratings?.graphics || 4) * 20"
                  color="primary"
                />
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span>Jugabilidad</span>
                  <span class="font-semibold"
                    >{{ game.ratings?.gameplay || 4.5 }}/5</span
                  >
                </div>
                <UProgress
                  :value="(game.ratings?.gameplay || 4.5) * 20"
                  color="primary"
                />
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span>Entretenimiento</span>
                  <span class="font-semibold"
                    >{{ game.ratings?.fun || 3.8 }}/5</span
                  >
                </div>
                <UProgress
                  :value="(game.ratings?.fun || 3.8) * 20"
                  color="primary"
                />
              </div>
            </div>

            <div class="mt-6">
              <UButton
                color="primary"
                block
                @click="showEvaluationModal = true"
              >
                <template #leading>
                  <UIcon name="i-heroicons-star" />
                </template>
                Evaluar este juego
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

      <!-- Modal de evaluación -->
      <UModal v-model="showEvaluationModal" :ui="{ width: 'max-w-md' }">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Evaluar juego</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="-my-1"
                @click="showEvaluationModal = false"
              />
            </div>
          </template>

          <form @submit.prevent="submitEvaluation" class="space-y-6">
            <UFormGroup label="Gráficos" name="graphics">
              <URating
                v-model="userRating.graphics"
                :length="5"
                :half="false"
              />
            </UFormGroup>

            <UFormGroup label="Jugabilidad" name="gameplay">
              <URating
                v-model="userRating.gameplay"
                :length="5"
                :half="false"
              />
            </UFormGroup>

            <UFormGroup label="Entretenimiento" name="fun">
              <URating v-model="userRating.fun" :length="5" :half="false" />
            </UFormGroup>

            <UFormGroup label="Comentarios (opcional)" name="comments">
              <UTextarea
                v-model="userRating.comments"
                placeholder="Escribe tus comentarios sobre el juego..."
              />
            </UFormGroup>
          </form>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="gray"
                variant="solid"
                @click="showEvaluationModal = false"
              >
                Cancelar
              </UButton>
              <UButton
                color="primary"
                :loading="isSubmitting"
                @click="submitEvaluation"
              >
                Enviar evaluación
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

// Definición de metadatos para SEO
definePageMeta({
  title: "Detalle de Juego",
  description: "Visualización y evaluación de juego",
});

// Obtener el ID del juego de la URL
const route = useRoute();
const gameId = route.params.id;

// Estados
const isLoading = ref(true);
const game = ref(null);
const activeTab = ref("game");
const showEvaluationModal = ref(false);
const isSubmitting = ref(false);

// Ejemplo de juego para mostrar (se reemplazará con datos de Firebase)
const mockGame = {
  id: "1",
  title: "Pudú Aventurero",
  description:
    "Ayuda a Pudín el pudú a recorrer los bosques del sur de Chile, esquivando peligros y recogiendo frutos nativos.",
  longDescription: `
    <p>En <strong>Pudú Aventurero</strong>, te sumergirás en los hermosos paisajes del sur de Chile mientras acompañas a Pudín, un valiente pudú, en su viaje por los bosques nativos.</p>
    <p>Tu misión es ayudar a Pudín a recolectar frutos silvestres, encontrar a su familia y evitar los peligros que acechan en el bosque, como cazadores furtivos y depredadores naturales.</p>
    <p>A medida que avanzas, descubrirás datos interesantes sobre esta especie en peligro de extinción y aprenderás sobre la importancia de preservar su hábitat natural.</p>
  `,
  author: "Juan Pérez",
  theme: "Pudú Aventurero",
  coverImage: "https://placehold.co/1200x600?text=Pudu+Aventurero",
  rating: 4.5,
  createdAt: new Date("2023-11-15"),
  version: "1.2.0",
  size: "24 MB",
  instructions:
    "Usa las flechas para moverte, la barra espaciadora para saltar, y Z para recoger elementos.",
  ratings: {
    graphics: 4.2,
    gameplay: 4.7,
    fun: 4.6,
  },
};

// Obtener los datos del juego
onMounted(async () => {
  try {
    // Simulamos una llamada a la API (se reemplazará con Firebase)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Comprobar si el ID coincide con nuestro juego de ejemplo
    if (gameId === "1") {
      game.value = mockGame;

      // Actualizar los metadatos de la página
      updateHead({
        title: `${mockGame.title} - EVA Videojuegos`,
        description: mockGame.description.slice(0, 160),
      });
    }
  } catch (error) {
    console.error("Error al cargar el juego:", error);
  } finally {
    isLoading.value = false;
  }
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

// Estado para la evaluación del usuario
const userRating = reactive({
  graphics: 0,
  gameplay: 0,
  fun: 0,
  comments: "",
});

// Enviar evaluación
const submitEvaluation = async () => {
  // Validar que se han proporcionado todas las calificaciones
  if (
    userRating.graphics === 0 ||
    userRating.gameplay === 0 ||
    userRating.fun === 0
  ) {
    alert("Por favor, califica todas las categorías antes de enviar.");
    return;
  }

  try {
    isSubmitting.value = true;

    // Simular envío a Firebase (será reemplazado por la implementación real)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Cerrar modal y mostrar mensaje de éxito
    showEvaluationModal.value = false;

    // Reiniciar formulario
    userRating.graphics = 0;
    userRating.gameplay = 0;
    userRating.fun = 0;
    userRating.comments = "";

    // Mostrar mensaje de éxito
    alert("¡Gracias por tu evaluación!");
  } catch (error) {
    console.error("Error al enviar la evaluación:", error);
    alert(
      "Hubo un error al enviar tu evaluación. Por favor, intenta nuevamente."
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
