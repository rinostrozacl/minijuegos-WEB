<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Preguntas frecuentes</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Respuestas a dudas comunes sobre GameCraft2026, el torneo de desarrollo
          en Unity con temáticas mitológicas.
        </p>
      </div>

      <div class="mb-8">
        <GameCraftConcept />
      </div>

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

      <div class="mb-8">
        <UInput
          v-model="searchQuery"
          placeholder="Buscar pregunta..."
          :ui="{ icon: { trailing: { name: 'i-heroicons-magnifying-glass' } } }"
          class="w-full"
        />
      </div>

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

      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">¿No encontraste lo que buscabas?</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Escribe al equipo del curso o revisa las bases completas.
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
            Bases del torneo
          </UButton>
          <UButton to="/contacto" color="primary">
            <template #leading>
              <UIcon name="i-heroicons-envelope" />
            </template>
            Contacto
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import GameCraftConcept from "~/components/GameCraftConcept.vue";

definePageMeta({
  title: "Preguntas frecuentes",
  description:
    "FAQ GameCraft2026 — torneo Unity, temáticas mitológicas y uso de Gamecraft.cl",
  middleware: ["auth"],
});

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

const selectedCategory = ref("all");
const searchQuery = ref("");
const expandedItems = ref({});

const faqs = [
  {
    id: 1,
    title: "¿Quiénes pueden participar?",
    content: `
      <p>Estudiantes de la carrera de Ingeniería en Informática que cursen la asignatura de programación de videojuegos, según la convocatoria del docente.</p>
      <p>Debes registrarte en Gamecraft.cl con el correo institucional que indique el curso (habitualmente @alumnos.santotomas.cl) y validar tu correo.</p>
    `,
    category: "general",
  },
  {
    id: 2,
    title: "¿Puedo participar en equipo?",
    content: `
      <p>Sí: de forma individual o en <strong>parejas</strong>. No se permiten equipos de tres o más personas.</p>
      <p><strong>Importante (parejas):</strong> solo una persona elige la temática en la plataforma. Luego debe <strong>agregar</strong> a su compañero o compañera en Gamecraft.cl para que queden vinculados al mismo proyecto.</p>
    `,
    category: "requisitos",
  },
  {
    id: 3,
    title: "¿Cuándo debo inscribirme y elegir temática?",
    content: `
      <p>Según el calendario oficial 2026, la inscripción en plataforma y la elección de temática corresponden al <strong>lunes 23 de abril de 2026</strong> (selección de temática).</p>
      <p>La presentación del torneo (etapa 0) es el <strong>lunes 20 de abril de 2026</strong>.</p>
    `,
    category: "fechas",
  },
  {
    id: 4,
    title: "¿Qué motor y formato debo usar?",
    content: `
      <p>El motor obligatorio es <strong>Unity</strong>. El juego debe poder publicarse en web; en esta plataforma se usa habitualmente la exportación <strong>WebGL</strong> para la build jugable.</p>
      <p>La pauta también contempla publicación en sitios como <strong>itch.io</strong> como ejemplo de plataforma web: confirma con tu docente cuál es la entrega oficial.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 5,
    title: "¿Cómo se evalúa el proyecto?",
    content: `
      <p>El proceso tiene <strong>etapas</strong> con entregables y pautas de evaluación en escala <strong>1 a 5</strong> (diseño conceptual, diseño gráfico, prototipo jugable y playtesting), más una etapa final de <strong>publicación y evaluación abierta</strong>.</p>
      <p>Los criterios exactos por etapa están en la sección Bases del sitio y en el documento <code>pautas_de_evaluacion.md</code> del repositorio.</p>
    `,
    category: "evaluacion",
  },
  {
    id: 6,
    title: "¿Cómo reservo una temática?",
    content: `
      <ol>
        <li>Crear cuenta e iniciar sesión en Gamecraft.cl.</li>
        <li>Validar tu correo electrónico.</li>
        <li>Ir a <strong>Temáticas</strong>, elegir una leyenda disponible y confirmar la reserva.</li>
      </ol>
      <p>Una vez reservada, no podrás cambiarla: elige con cuidado. En pareja, reserva solo el integrante que inscribe la temática.</p>
    `,
    category: "general",
  },
  {
    id: 7,
    title: "¿Puedo usar assets de terceros?",
    content: `
      <p>Sí, si cumples licencias y atribución. Se valora el trabajo original del equipo, pero no es obligatorio fabricar todos los assets desde cero.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 8,
    title: "¿Cuál es la fecha de cierre del torneo en la pauta?",
    content: `
      <p>La <strong>etapa 5</strong> (publicación y evaluación abierta) está fijada el <strong>lunes 22 de junio de 2026</strong>.</p>
      <p>No dejes la subida de build para el último minuto: revisa límites de tamaño y prueba WebGL en navegador.</p>
    `,
    category: "fechas",
  },
  {
    id: 9,
    title: "¿Cómo entrego mi build en Gamecraft.cl?",
    content: `
      <p>Desde la sección de tu juego en la plataforma, sube el archivo que indique el docente (por ejemplo un .zip con WebGL) respetando el tamaño máximo configurado (referencia habitual: hasta 50 MB en esta plataforma).</p>
      <p>Incluye instrucciones claras si el docente pide documentación aparte.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 10,
    title: "¿Quiénes evalúan al final?",
    content: `
      <p>En las etapas intermedias evalúa el docente según rúbricas. En la etapa final la pauta prevé que <strong>todos los jugadores</strong> puedan evaluar los juegos con escala 1 a 5 y que los resultados se promedien según la mecánica definida en el curso.</p>
    `,
    category: "evaluacion",
  },
  {
    id: 11,
    title: "¿Mi juego debe funcionar en móvil?",
    content: `
      <p>La pauta oficial prioriza un juego web jugable y estable. Es <strong>altamente recomendable</strong> probar en distintos navegadores y, si tu docente lo exige para la demo o el playtesting, también en móvil con controles táctiles.</p>
    `,
    category: "desarrollo",
  },
  {
    id: 12,
    title: "¿Qué temáticas hay?",
    content: `
      <p>Hay <strong>30 leyendas mitológicas</strong> definidas en la pauta del curso. En Gamecraft.cl verás la lista cargada por el administrador (títulos, cultura de origen y descripción breve).</p>
    `,
    category: "general",
  },
];

const filteredFaqs = computed(() => {
  let result = faqs;
  if (selectedCategory.value !== "all") {
    result = result.filter((faq) => faq.category === selectedCategory.value);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (faq) =>
        faq.title.toLowerCase().includes(query) ||
        faq.content.toLowerCase().includes(query)
    );
  }
  return result.map((faq) => ({
    id: faq.id,
    label: faq.title,
    content: faq.content,
  }));
});

const toggleItem = (id) => {
  expandedItems.value[id] = !expandedItems.value[id];
};

const resetFilters = () => {
  selectedCategory.value = "all";
  searchQuery.value = "";
};
</script>
