<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Preguntas Frecuentes</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Respuestas a las dudas más comunes sobre GameCraft2025, la competencia
          universitaria de desarrollo de videojuegos.
        </p>
      </div>

      <!-- Componente que explica el concepto de GameCraft2025 -->
      <div class="mb-8">
        <GameCraftConcept />
      </div>

      <!-- Filtro de categorías -->
      <div class="flex justify-center flex-wrap gap-2 mb-8">
        <UButton
          v-for="category in categories"
          :key="category.id"
          @click="
            selectedCategory =
              category.id === selectedCategory ? 'all' : category.id
          "
          :color="selectedCategory === category.id ? 'primary' : 'gray'"
          :variant="selectedCategory === category.id ? 'solid' : 'ghost'"
          class="mb-2"
        >
          <template #leading>
            <UIcon :name="category.icon" />
          </template>
          {{ category.name }}
        </UButton>
      </div>

      <!-- Buscador -->
      <div class="mb-8">
        <UInput
          v-model="searchQuery"
          placeholder="Buscar pregunta..."
          :ui="{ icon: { trailing: { name: 'i-heroicons-magnifying-glass' } } }"
          class="w-full"
        />
      </div>

      <!-- Acordeón de preguntas -->
      <div
        v-if="filteredFaqs.length > 0"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700"
      >
        <div
          v-for="(faq, index) in filteredFaqs"
          :key="index"
          class="border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <div
            class="py-4 px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
            @click="toggleItem(faq.id)"
          >
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium">{{ faq.label }}</h3>
              <UIcon
                :name="
                  expandedItems[faq.id]
                    ? 'i-heroicons-chevron-up'
                    : 'i-heroicons-chevron-down'
                "
                class="text-gray-500"
              />
            </div>
          </div>
          <div v-if="expandedItems[faq.id]" class="px-6 pb-4">
            <div
              v-html="faq.content"
              class="prose dark:prose-invert max-w-none py-2"
            ></div>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div
        v-else
        class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <UIcon
          name="i-heroicons-face-frown"
          class="h-16 w-16 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-xl font-semibold mb-2">No se encontraron preguntas</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          No hay preguntas que coincidan con tu búsqueda.
        </p>
        <UButton @click="resetFilters" color="primary">
          Ver todas las preguntas
        </UButton>
      </div>

      <!-- Contacto para más consultas -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">
          ¿No encontraste lo que buscabas?
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Si tienes otras dudas que no han sido respondidas aquí, puedes ponerte
          en contacto con el equipo organizador a través de los siguientes
          medios:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <UIcon name="i-heroicons-envelope" class="mr-3 text-primary" />
            <span>ricardoinostrozare@santotomas.cl</span>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-4">
          <UButton to="/bases" color="primary" variant="outline">
            <template #leading>
              <UIcon name="i-heroicons-document-text" />
            </template>
            Ver bases del concurso
          </UButton>

          <UButton to="/contacto" color="primary">
            <template #leading>
              <UIcon name="i-heroicons-envelope" />
            </template>
            Contactar al equipo
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import GameCraftConcept from "~/components/GameCraftConcept.vue";

// Definición de metadatos para SEO
definePageMeta({
  title: "Preguntas Frecuentes",
  description:
    "Respuestas a dudas comunes sobre GameCraft2025, la competencia universitaria de desarrollo de videojuegos",
  middleware: ["auth"],
});

// Categorías para filtrar
const categories = [
  { id: "all", name: "Todas", icon: "i-heroicons-squares-2x2" },
  { id: "general", name: "General", icon: "i-heroicons-information-circle" },
  {
    id: "requisitos",
    name: "Requisitos",
    icon: "i-heroicons-clipboard-document-check",
  },
  { id: "desarrollo", name: "Desarrollo", icon: "i-heroicons-code-bracket" },
  { id: "fechas", name: "Fechas", icon: "i-heroicons-calendar" },
  { id: "evaluacion", name: "Evaluación", icon: "i-heroicons-star" },
];

// Estado para filtros
const selectedCategory = ref("all");
const searchQuery = ref("");

// Estado para el acordeón
const expandedItems = ref({});

// Lista de preguntas frecuentes
const faqs = [
  {
    id: 1,
    title: "¿Quiénes pueden participar en la competencia?",
    content: `
      <p>Pueden participar los estudiantes de la carrera de Ingeniería en Informática que estén cursando la asignatura de programación de videojuegos.</p>
      <p>Es necesario registrarse en la plataforma utilizando el correo institucional (@alumnos.santotomas.cl) para poder participar.</p>
    `,
    category: "general",
  },
  {
    id: 2,
    title: "¿Puedo participar en equipo?",
    content: `
      <p>Sí, puedes participar de forma individual o en equipos de hasta 2 estudiantes. Todos los miembros del equipo deben registrarse en la plataforma.</p>
      <p>Un estudiante solo puede participar en un equipo o proyecto.</p>
    `,
    category: "requisitos",
  },
  {
    id: 3,
    title: "¿Cuál es la fecha límite para inscribirme?",
    content: `
      <p>La fecha límite para inscribirse y reservar una temática es el 14 de mayo de 2024.</p>
      <p>Te recomendamos no dejar la inscripción para último momento, ya que las temáticas se van reservando y podrías quedarte sin la que más te interesa.</p>
    `,
    category: "fechas",
  },
  {
    id: 4,
    title: "¿Qué tecnologías puedo utilizar para desarrollar mi juego?",
    content: `
      <p>Para esta competencia, la única tecnología permitida es:</p>
      <ul>
        <li>Unity (exportación WebGL)</li>
      </ul>
      <p>Si tienes dudas sobre el proceso de exportación o configuración, puedes consultar al equipo organizador.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 5,
    title: "¿Cuáles son los criterios para evaluar los juegos?",
    content: `
      <p>Los juegos serán evaluados según los siguientes criterios:</p>
      <ul>
        <li><strong>Originalidad y creatividad (25%):</strong> Valoración de la propuesta creativa, innovación y originalidad del concepto.</li>
        <li><strong>Implementación de la temática chilena (20%):</strong> Efectividad en la representación e integración de la temática chilena seleccionada.</li>
        <li><strong>Jugabilidad (20%):</strong> Calidad de la experiencia de juego, controles intuitivos y diversión.</li>
        <li><strong>Calidad técnica (15%):</strong> Ausencia de errores, optimización, tiempos de carga y rendimiento general.</li>
        <li><strong>Diseño visual y sonoro (10%):</strong> Calidad de gráficos, interfaz de usuario, efectos visuales y audio.</li>
        <li><strong>Documentación (10%):</strong> Calidad de las instrucciones, documentación técnica y presentación del proyecto.</li>
      </ul>
    `,
    category: "evaluacion",
  },
  {
    id: 6,
    title: "¿Cómo reservo una temática para mi juego?",
    content: `
      <p>Para reservar una temática debes:</p>
      <ol>
        <li>Registrarte en la plataforma con tu correo institucional</li>
        <li>Iniciar sesión</li>
        <li>Ir a la sección "Temáticas"</li>
        <li>Seleccionar la temática que te interese y que esté disponible</li>
        <li>Hacer clic en "Reservar temática" y confirmar</li>
      </ol>
      <p>Una vez reservada una temática, no podrás cambiarla, así que elige con cuidado.</p>
    `,
    category: "general",
  },
  {
    id: 7,
    title: "¿Puedo usar assets o recursos de terceros en mi juego?",
    content: `
      <p>Sí, puedes utilizar assets o recursos de terceros (gráficos, sonidos, modelos 3D, etc.) siempre y cuando:</p>
      <ul>
        <li>Tengas los derechos o licencias correspondientes para utilizarlos</li>
        <li>Respetes los términos de las licencias</li>
        <li>Documentes y atribuyas correctamente estos recursos en la documentación de tu proyecto</li>
      </ul>
      <p>Se valorará positivamente el uso de recursos originales creados por el equipo, pero no es obligatorio.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 8,
    title: "¿Qué pasa si no puedo terminar mi juego a tiempo?",
    content: `
      <p>La fecha límite para la entrega de proyectos es el 23 de junio de 2024 a las 23:59 horas. No habrá prórroga para esta fecha.</p>
      <p>Te recomendamos planificar adecuadamente tu desarrollo y considerar un margen de tiempo para imprevistos. Si por alguna razón no puedes completar tu juego a tiempo, podrás entregar lo que tengas desarrollado hasta ese momento, pero ten en cuenta que uno de los criterios de evaluación es la completitud del proyecto.</p>
    `,
    category: "fechas",
  },
  {
    id: 9,
    title: "¿Cómo debo entregar mi proyecto finalizado?",
    content: `
      <p>Para entregar tu proyecto finalizado, deberás:</p>
      <ol>
        <li>Comprimir todos los archivos necesarios para la ejecución del juego</li>
        <li>Subir el archivo comprimido a la plataforma en la sección "Mi Juego" antes de la fecha límite</li>
        <li>Incluir un documento con instrucciones claras para ejecutar el juego</li>
        <li>Adjuntar una documentación técnica básica que explique las características principales del juego y cómo se ha implementado la temática chilena</li>
      </ol>
      <p>El tamaño máximo del archivo comprimido es de 50MB. Si tu proyecto es más grande, contacta al equipo organizador para coordinar una forma alternativa de entrega.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 10,
    title: "¿Quiénes serán los jueces de la competencia?",
    content: `
      <p>El jurado estará compuesto por:</p>
      <ul>
        <li>Docentes de la carrera de Ingeniería en Informática</li>
        <li>Alumnos de la institución que participen en la votación</li>
      </ul>
      <p>La evaluación final considerará tanto el criterio técnico de los docentes como la popularidad entre los estudiantes.</p>
    `,
    category: "evaluacion",
  },
  {
    id: 11,
    title: "¿Mi juego debe funcionar en dispositivos móviles?",
    content: `
      <p>Sí, es un requisito que tu juego funcione correctamente en dispositivos móviles.</p>
      <p>El juego debe estar adaptado para pantallas táctiles y diferentes resoluciones, garantizando una experiencia de usuario adecuada tanto en dispositivos móviles como en navegadores de escritorio con soporte para WebGL.</p>
      <p>Asegúrate de probar tu juego en diferentes dispositivos antes de la entrega final.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 12,
    title: "¿Qué pasa si tengo problemas técnicos durante el desarrollo?",
    content: `
      <p>Si enfrentas problemas técnicos durante el desarrollo, tienes varias opciones de ayuda:</p>
      <ul>
        <li>Consulta al equipo organizador a través del correo electrónico oficial</li>
        <li>Asiste a las sesiones de mentoría que se organizarán durante el período de desarrollo (las fechas se anunciarán oportunamente)</li>
      </ul>
      <p>Recuerda que, aunque puedes recibir ayuda y consejos, el desarrollo debe ser realizado íntegramente por ti o tu equipo.</p>
    `,
    category: "desarrollo",
  },
];

// Filtrar preguntas según la categoría seleccionada y la búsqueda
const filteredFaqs = computed(() => {
  let result = faqs;

  // Filtrar por categoría
  if (selectedCategory.value !== "all") {
    result = result.filter((faq) => faq.category === selectedCategory.value);
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (faq) =>
        faq.title.toLowerCase().includes(query) ||
        faq.content.toLowerCase().includes(query)
    );
  }

  // Solo devolver los datos filtrados
  return result.map((faq) => ({
    id: faq.id,
    label: faq.title,
    content: faq.content,
  }));
});

// Función para alternar el estado de expansión
const toggleItem = (id) => {
  expandedItems.value[id] = !expandedItems.value[id];
};

// Resetear filtros
const resetFilters = () => {
  selectedCategory.value = "all";
  searchQuery.value = "";
};
</script>
