<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Bases del torneo</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Información oficial sobre reglas, calendario y condiciones para
          participar en GameCraft2026 (pauta Proyecto Final Desarrollo en
          Videojuegos 2026).
        </p>
      </div>

      <div class="mb-8">
        <GameCraftConcept />
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Contenidos</h2>
        <ul class="space-y-2">
          <li v-for="(section, index) in sections" :key="index">
            <a
              :href="`#${section.id}`"
              class="text-primary hover:underline flex items-center"
              @click.prevent="scrollToSection(section.id)"
            >
              <UIcon name="i-heroicons-document-text" class="mr-2" />
              {{ section.title }}
            </a>
          </li>
        </ul>
      </div>

      <div class="space-y-8">
        <div
          id="descripcion"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Descripción</h2>
          <div class="prose dark:prose-invert max-w-none">
            <p>
              GameCraft2026 es una competencia de desarrollo de videojuegos en
              <strong>Unity</strong> en la que los estudiantes diseñan,
              prototipan y publican un juego funcional a partir de una
              <strong>temática mitológica</strong> asignada mediante esta
              plataforma (Gamecraft.cl).
            </p>
            <p>
              El torneo se imparte en el marco del Instituto Profesional Santo
              Tomás (asignatura de programación de videojuegos), en coordinación
              con las directrices del área (Dirección Nacional Área Informática).
            </p>
            <p>Objetivos formativos del torneo:</p>
            <ul>
              <li>Diseño de videojuegos</li>
              <li>Programación</li>
              <li>Narrativa interactiva</li>
              <li>Trabajo colaborativo</li>
              <li>Pensamiento creativo</li>
            </ul>
            <p>
              Cada equipo entrega un juego completo, desde la idea inicial hasta
              una versión jugable publicada en la web (por ejemplo WebGL en esta
              plataforma o publicación en sitios como itch.io, según indique el
              docente).
            </p>
          </div>
        </div>

        <div
          id="requisitos"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Modalidad y plataforma</h2>
          <div class="prose dark:prose-invert max-w-none">
            <ul>
              <li>Participación <strong>individual o en parejas</strong>.</li>
              <li>No se permiten equipos de tres o más personas.</li>
              <li>
                En pareja: <strong>solo una persona</strong> inscribe la
                temática en Gamecraft.cl y luego <strong>agrega</strong> a su
                compañero o compañera en la plataforma.
              </li>
            </ul>
            <p><strong>Requisitos en la plataforma:</strong></p>
            <ul>
              <li>Registrarse y validar el correo electrónico.</li>
              <li>Completar la inscripción y seleccionar una temática.</li>
              <li>
                Lista de 30 temáticas mitológicas gestionada por el docente; la
                asignación se realiza mediante la plataforma.
              </li>
            </ul>
            <p>
              Para participar en esta instancia institucional se requiere ser
              alumno regular, estar matriculado en la carrera de Ingeniería en
              Informática y cursar la asignatura correspondiente, y registrarse
              con el correo institucional indicado por el curso
              (@alumnos.santotomas.cl), salvo norma distinta del docente.
            </p>
          </div>
        </div>

        <div
          id="plazos"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Calendario oficial (2026)</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Las actividades del calendario oficial se realizan los días
            <strong>lunes</strong> indicados. La inscripción y la selección de
            temática pueden completarse en el periodo señalado antes de la Etapa
            1.
          </p>
          <div class="not-prose space-y-4">
            <div v-for="(phase, index) in phases" :key="index" class="flex">
              <div class="flex flex-col items-center mr-4">
                <div
                  class="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center font-bold text-sm"
                >
                  {{ index + 1 }}
                </div>
                <div
                  v-if="index < phases.length - 1"
                  class="w-0.5 bg-gray-300 dark:bg-gray-600 grow mt-2"
                />
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg grow">
                <h3 class="font-semibold text-lg mb-1">{{ phase.name }}</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-2">
                  {{ phase.description }}
                </p>
                <div class="flex items-center text-sm">
                  <UIcon
                    name="i-heroicons-calendar"
                    class="mr-2 text-primary"
                  />
                  <span class="font-medium">{{ phase.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          id="especificaciones"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Reglas técnicas (pauta)</h2>
          <div class="prose dark:prose-invert max-w-none mb-6">
            <ul>
              <li><strong>Motor obligatorio:</strong> Unity.</li>
              <li>
                <strong>Duración orientativa del juego final:</strong> ~10
                minutos de experiencia.
              </li>
              <li>
                <strong>Límites de alcance:</strong> como máximo 2 mecánicas
                principales, 1 nivel obligatorio y 1 personaje jugable.
              </li>
              <li>
                <strong>Prototipo jugable (Etapa 3):</strong> gameplay
                aproximado de ~5 minutos, con mecánicas principales y al menos
                un nivel.
              </li>
            </ul>
            <p>
              Todos los estudiantes deben participar. Se evalúa el
              <strong>proceso completo</strong> y los avances, no solo el
              resultado final, con retroalimentación constructiva.
            </p>
          </div>

          <h3 class="text-xl font-medium mb-3">Publicación en Gamecraft.cl</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Además de las reglas del curso, la build que subas a esta
            plataforma debe respetar los límites técnicos vigentes del sitio
            (por ejemplo exportación WebGL, tamaño máximo y resoluciones
            admitidas). Consulta al docente si tu entrega oficial incluye un
            enlace externo (p. ej. itch.io).
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-cube-transparent"
                class="text-primary w-6 h-6 shrink-0"
              />
              <div>
                <h4 class="font-semibold text-sm">Motor</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">Unity</p>
              </div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-globe-alt"
                class="text-primary w-6 h-6 shrink-0"
              />
              <div>
                <h4 class="font-semibold text-sm">Formato web</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  WebGL u otra publicación web acordada
                </p>
              </div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-arrow-down-tray"
                class="text-primary w-6 h-6 shrink-0"
              />
              <div>
                <h4 class="font-semibold text-sm">Tamaño (plataforma)</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Hasta 50 MB por build en esta plataforma
                </p>
              </div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-viewfinder-circle"
                class="text-primary w-6 h-6 shrink-0"
              />
              <div>
                <h4 class="font-semibold text-sm">Resolución sugerida</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  800×600 hasta 1920×1080
                </p>
              </div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-device-phone-mobile"
                class="text-primary w-6 h-6 shrink-0"
              />
              <div>
                <h4 class="font-semibold text-sm">Compatibilidad</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Navegadores con WebGL; se recomienda probar en escritorio y
                  móvil si el docente lo exige para la demo.
                </p>
              </div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-sparkles"
                class="text-primary w-6 h-6 shrink-0"
              />
              <div>
                <h4 class="font-semibold text-sm">Temática</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  Debe reflejar la leyenda mitológica asignada
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          id="entregables"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Entregables por etapa</h2>
          <div class="space-y-6">
            <div
              v-for="block in deliverableBlocks"
              :key="block.title"
              class="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border-l-4 border-primary"
            >
              <h3 class="text-lg font-semibold mb-2">{{ block.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {{ block.date }}
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(item, i) in block.items"
                  :key="i"
                  class="flex items-start gap-2 text-sm"
                >
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="text-primary mt-0.5 shrink-0"
                  />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          id="evaluacion"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Evaluación (escala 1 a 5)</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            En las etapas con pauta, cada criterio se califica de 1 a 5. La
            evaluación final abierta utiliza la misma escala; los resultados se
            promedian según lo definido en el curso.
          </p>

          <div class="space-y-8">
            <div
              v-for="rubric in rubricStages"
              :key="rubric.stage"
              class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
            >
              <div class="bg-primary/10 px-4 py-3">
                <h3 class="font-semibold text-lg">{{ rubric.stage }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{ rubric.date }}
                </p>
              </div>
              <div class="overflow-x-auto">
                <table
                  class="min-w-full text-sm text-left border-t border-gray-200 dark:border-gray-600"
                >
                  <thead
                    class="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                  >
                    <tr>
                      <th class="px-4 py-2 font-semibold">Criterio</th>
                      <th class="px-4 py-2 font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, ri) in rubric.rows"
                      :key="ri"
                      class="border-t border-gray-100 dark:border-gray-700"
                    >
                      <td class="px-4 py-2 font-medium align-top">
                        {{ row.name }}
                      </td>
                      <td class="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {{ row.desc }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-primary mt-6"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-information-circle"
                class="w-5 h-5 text-primary mt-0.5 shrink-0"
              />
              <p class="text-sm">
                Detalle ampliado en
                <NuxtLink
                  to="/faq"
                  class="text-primary hover:underline font-medium"
                  >FAQ</NuxtLink
                >
                y en el archivo
                <code class="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded"
                  >pautas_de_evaluacion.md</code
                >
                del repositorio.
              </p>
            </div>
          </div>
        </div>

        <div
          id="premios"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Categorías de premiación</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Según la pauta oficial del torneo, se reconocen las siguientes
            categorías (sin perjuicio de la logística de ceremonia que defina el
            docente).
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="cat in awardCategories"
              :key="cat.title"
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex gap-3 items-start"
            >
              <span class="text-2xl" aria-hidden="true">{{ cat.icon }}</span>
              <div>
                <h3 class="font-semibold">{{ cat.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {{ cat.description }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-primary"
          >
            <p class="text-sm">
              Fecha de cierre de etapa de publicación y evaluación abierta:
              <strong>22 de junio de 2026</strong>. Cualquier fecha de ceremonia
              o entrega de certificados será anunciada por el docente o el
              Instituto.
            </p>
          </div>
        </div>

        <div
          id="propiedad"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Propiedad intelectual</h2>
          <div class="prose dark:prose-invert max-w-none">
            <p>
              Los participantes mantienen la propiedad intelectual de sus
              juegos. Al participar, otorgan al Instituto Profesional Santo Tomás
              una licencia no exclusiva para exhibir, promover y publicar los
              juegos en la plataforma del torneo y en eventos relacionados.
            </p>
            <p>Los participantes deben garantizar que el contenido:</p>
            <ul>
              <li>Es original o cuenta con las licencias correspondientes.</li>
              <li>No infringe derechos de terceros.</li>
              <li>No contiene material ofensivo, discriminatorio o inapropiado.</li>
            </ul>
          </div>
        </div>

        <div
          id="contacto"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Consultas y contacto</h2>
          <div class="prose dark:prose-invert max-w-none mb-6">
            <p>
              Para dudas sobre la competencia o la plataforma, contacta al
              comité del curso.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <UIcon
                name="i-heroicons-envelope"
                class="mr-3 text-primary shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">Correo</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  ricardoinostrozare@santotomas.cl
                </p>
              </div>
            </div>
            <div
              class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <UIcon
                name="i-heroicons-user"
                class="mr-3 text-primary shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">Coordinación</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  Prof. Ricardo Inostroza Rebolledo
                </p>
              </div>
            </div>
            <div
              class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2"
            >
              <UIcon
                name="i-heroicons-question-mark-circle"
                class="mr-3 text-primary shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">FAQ</h3>
                <NuxtLink to="/faq" class="text-primary hover:underline">
                  Preguntas frecuentes
                </NuxtLink>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <UButton to="/registro" color="primary" block size="lg">
              <template #leading>
                <UIcon name="i-heroicons-user-plus" />
              </template>
              Registrarse en la plataforma
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GameCraftConcept from "~/components/GameCraftConcept.vue";

definePageMeta({
  title: "Bases del torneo",
  description:
    "Reglas, calendario y evaluación GameCraft2026 — torneo Unity con temáticas mitológicas",
  middleware: ["auth"],
});

const sections = [
  { id: "descripcion", title: "Descripción" },
  { id: "requisitos", title: "Modalidad y plataforma" },
  { id: "plazos", title: "Calendario oficial" },
  { id: "especificaciones", title: "Reglas técnicas y publicación" },
  { id: "entregables", title: "Entregables por etapa" },
  { id: "evaluacion", title: "Evaluación (1 a 5)" },
  { id: "premios", title: "Premiación" },
  { id: "propiedad", title: "Propiedad intelectual" },
  { id: "contacto", title: "Consultas y contacto" },
];

const phases = [
  {
    name: "Etapa 0 — Inicio",
    description:
      "Presentación del torneo, reglas, etapas y uso de la plataforma Gamecraft.cl.",
    date: "Lunes 27 de abril de 2026",
  },
  {
    name: "Selección de temática",
    description:
      "Inscripción en la plataforma, validación de correo y elección de temática mitológica.",
    date: "Del 27 de abril al 3 de mayo de 2026",
  },
  {
    name: "Etapa 1 — Diseño conceptual",
    description: "Bocetos de personajes, historia del juego y gameplay.",
    date: "Lunes 4 de mayo de 2026",
  },
  {
    name: "Etapa 2 — Diseño gráfico",
    description: "Personajes finales, interfaz (UI/GUI) y escenario principal.",
    date: "Lunes 11 de mayo de 2026",
  },
  {
    name: "Etapa 3 — Prototipo jugable",
    description:
      "Juego funcional con mecánicas principales y al menos un nivel; gameplay aproximado ~5 minutos.",
    date: "Lunes 25 de mayo de 2026",
  },
  {
    name: "Etapa 4 — Evaluación externa (playtesting)",
    description:
      "Los estudiantes prueban juegos de otros compañeros y registran la pauta de playtesting.",
    date: "Lunes 8 de junio de 2026",
  },
  {
    name: "Etapa 5 — Publicación y evaluación abierta",
    description:
      "Publicación del juego en web y evaluación abierta con escala 1 a 5; resultados según mecánica del curso.",
    date: "Lunes 22 de junio de 2026",
  },
];

const deliverableBlocks = [
  {
    title: "Etapa 0 e inscripción",
    date: "27 de abril al 3 de mayo de 2026",
    items: [
      "Asistir a la presentación del torneo (objetivo, reglas, etapas, uso de la plataforma).",
      "Ingresar a Gamecraft.cl, validar correo, inscribirse y elegir temática.",
      "En parejas: un integrante elige la temática y luego agrega al compañero en la plataforma.",
    ],
  },
  {
    title: "Etapa 1 — Diseño conceptual",
    date: "4 de mayo de 2026",
    items: [
      "Bocetos de personajes.",
      "Historia del juego.",
      "Descripción del gameplay.",
    ],
  },
  {
    title: "Etapa 2 — Diseño gráfico",
    date: "11 de mayo de 2026",
    items: [
      "Personajes finales.",
      "Interfaz (UI / GUI).",
      "Escenario principal.",
    ],
  },
  {
    title: "Etapa 3 — Prototipo jugable",
    date: "25 de mayo de 2026",
    items: [
      "Juego funcional en Unity.",
      "Mecánicas principales implementadas.",
      "Al menos un nivel.",
      "Condición de referencia: ~5 minutos de gameplay aproximado.",
    ],
  },
  {
    title: "Etapa 4 — Playtesting",
    date: "8 de junio de 2026",
    items: [
      "Jugar builds de otros equipos y aplicar la pauta: comprensión, diversión, estabilidad y uso de la temática mitológica.",
    ],
  },
  {
    title: "Etapa 5 — Cierre",
    date: "22 de junio de 2026",
    items: [
      "Publicar el build WebGL en GitHub Pages y enlazarlo en GameCraft desde /mis-juegos. itch.io es opcional como enlace anexo.",
      "Participar en la evaluación abierta (escala 1 a 5) según lo habilitado en el curso.",
    ],
  },
];

const rubricStages = [
  {
    stage: "Etapa 1 — Diseño conceptual",
    date: "4 de mayo de 2026",
    rows: [
      { name: "Creatividad", desc: "Originalidad de la idea." },
      { name: "Coherencia", desc: "Relación entre historia y mecánicas." },
      { name: "Claridad", desc: "Se entiende el juego." },
      { name: "Viabilidad", desc: "Es posible desarrollarlo en el plazo." },
    ],
  },
  {
    stage: "Etapa 2 — Diseño gráfico",
    date: "11 de mayo de 2026",
    rows: [
      { name: "Consistencia visual", desc: "Estilo uniforme." },
      { name: "Claridad", desc: "Elementos comprensibles." },
      { name: "Identidad", desc: "Estilo propio." },
      {
        name: "Calidad gráfica",
        desc: "Nivel de detalle y ejecución.",
      },
    ],
  },
  {
    stage: "Etapa 3 — Prototipo jugable",
    date: "25 de mayo de 2026",
    rows: [
      { name: "Jugabilidad", desc: "¿Es entretenido?" },
      { name: "Funcionamiento", desc: "¿Tiene errores?" },
      { name: "Claridad", desc: "¿Se entiende qué hacer?" },
      { name: "Implementación", desc: "Mecánicas bien ejecutadas." },
    ],
  },
  {
    stage: "Etapa 4 — Playtesting",
    date: "8 de junio de 2026",
    rows: [
      { name: "Comprensión", desc: "¿Se entiende el juego?" },
      { name: "Diversión", desc: "¿Es entretenido?" },
      { name: "Estabilidad", desc: "¿Funciona correctamente?" },
      { name: "Uso de temática", desc: "¿Se refleja la mitología?" },
    ],
  },
];

const awardCategories = [
  {
    icon: "🥇",
    title: "Mejor juego",
    description: "Reconocimiento a la propuesta integral más lograda.",
  },
  {
    icon: "🎨",
    title: "Mejor diseño",
    description: "Énfasis en coherencia visual, UI y escenografía.",
  },
  {
    icon: "📖",
    title: "Mejor narrativa",
    description: "Historia, temática mitológica y lectura del jugador.",
  },
  {
    icon: "💡",
    title: "Juego más innovador",
    description: "Ideas frescas en mecánicas o enfoque del proyecto.",
  },
];

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
</script>
