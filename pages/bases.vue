<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Bases del Concurso</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Información oficial sobre las reglas, plazos y condiciones para
          participar en GameCraft2025, la competencia de desarrollo de
          videojuegos con temáticas chilenas.
        </p>
      </div>

      <!-- Componente que explica el concepto de GameCraft2025 -->
      <div class="mb-8">
        <GameCraftConcept />
      </div>

      <!-- Índice de contenidos -->
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

      <!-- Secciones de las bases -->
      <div class="space-y-8">
        <!-- Sección 1: Descripción del Concurso -->
        <div
          id="descripcion"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Descripción del Concurso</h2>
          <div class="prose dark:prose-invert max-w-none">
            <p>
              GameCraft2025 es una iniciativa organizada por el Instituto
              Profesional Santo Tomás, destinada a fomentar el desarrollo de
              videojuegos que promuevan aspectos culturales, históricos,
              geográficos o naturales de Chile.
            </p>
            <p>
              Los participantes deberán desarrollar un videojuego web utilizando
              tecnologías compatibles con WebGL, eligiendo una temática chilena
              específica de entre las disponibles en la plataforma.
            </p>
          </div>
        </div>

        <!-- Sección 2: Requisitos de Participación -->
        <div
          id="requisitos"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">
            Requisitos de Participación
          </h2>
          <div class="prose dark:prose-invert max-w-none">
            <p>
              Para participar en la competencia, debes cumplir con los
              siguientes requisitos:
            </p>
            <ul>
              <li>Ser alumno regular del Instituto Profesional Santo Tomás</li>
              <li>
                Estar matriculado en la carrera de Ingeniería en Informática y
                estar cursando la asignatura de programación de videojuegos
              </li>
              <li>
                Registrarse en la plataforma de la competencia usando el correo
                institucional (@alumnos.santotomas.cl)
              </li>
              <li>Seleccionar y reservar una temática en la plataforma</li>
              <li>
                Desarrollar el juego de forma individual o en equipo (máximo 2
                personas)
              </li>
            </ul>
          </div>
        </div>

        <!-- Sección 3: Plazos y Fechas -->
        <div
          id="plazos"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Plazos y Fechas</h2>
          <div class="not-prose space-y-4">
            <div v-for="(phase, index) in phases" :key="index" class="flex">
              <div class="flex flex-col items-center mr-4">
                <div
                  class="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center font-bold"
                >
                  {{ index + 1 }}
                </div>
                <div
                  class="w-0.5 bg-gray-300 dark:bg-gray-600 grow mt-2"
                  v-if="index < phases.length - 1"
                ></div>
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

        <!-- Sección 4: Especificaciones Técnicas -->
        <div
          id="especificaciones"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Especificaciones Técnicas</h2>

          <!-- Requisitos generales en cards -->
          <div class="mb-6">
            <h3 class="text-xl font-medium mb-3">Requisitos generales</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
              >
                <UIcon
                  name="i-heroicons-device-phone-mobile"
                  class="text-primary mr-3 flex-shrink-0 w-6 h-6"
                />
                <div>
                  <h4 class="font-semibold text-sm">Plataformas</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Dispositivos móviles y escritorio
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
              >
                <UIcon
                  name="i-heroicons-cube-transparent"
                  class="text-primary mr-3 flex-shrink-0 w-6 h-6"
                />
                <div>
                  <h4 class="font-semibold text-sm">Tecnología</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Unity (exportación WebGL)
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
              >
                <UIcon
                  name="i-heroicons-arrow-down-tray"
                  class="text-primary mr-3 flex-shrink-0 w-6 h-6"
                />
                <div>
                  <h4 class="font-semibold text-sm">Tamaño máximo</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">50MB</p>
                </div>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
              >
                <UIcon
                  name="i-heroicons-viewfinder-circle"
                  class="text-primary mr-3 flex-shrink-0 w-6 h-6"
                />
                <div>
                  <h4 class="font-semibold text-sm">Resolución</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    800x600 hasta 1920x1080
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
              >
                <UIcon
                  name="i-heroicons-clock"
                  class="text-primary mr-3 flex-shrink-0 w-6 h-6"
                />
                <div>
                  <h4 class="font-semibold text-sm">Duración mínima</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    3 minutos de juego
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center"
              >
                <UIcon
                  name="i-heroicons-flag"
                  class="text-primary mr-3 flex-shrink-0 w-6 h-6"
                />
                <div>
                  <h4 class="font-semibold text-sm">Temática</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    Representación chilena adecuada
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Entregables por hito con timeline vertical -->
          <div>
            <h3 class="text-xl font-medium mb-3">Entregables por hito</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              El juego debe desarrollarse cumpliendo los siguientes requisitos
              en cada etapa:
            </p>

            <div class="space-y-6">
              <!-- Hito 2 -->
              <div
                class="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border-l-4 border-primary"
              >
                <h4 class="text-lg font-semibold mb-2 flex items-center">
                  <UIcon name="i-heroicons-flag" class="mr-2 text-primary" />
                  Hito 2: Primera Revisión
                </h4>
                <ul class="space-y-2 mt-3">
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Interfaz básica del juego</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Personaje principal definido con animaciones
                      básicas</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Escenario inicial establecido</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Controles funcionales tanto en pantalla táctil como
                      mediante teclado</span
                    >
                  </li>
                </ul>
              </div>

              <!-- Hito 3 -->
              <div
                class="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border-l-4 border-primary"
              >
                <h4 class="text-lg font-semibold mb-2 flex items-center">
                  <UIcon name="i-heroicons-flag" class="mr-2 text-primary" />
                  Hito 3: Segunda Revisión
                </h4>
                <ul class="space-y-2 mt-3">
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Escenario completamente terminado</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Controles de juego depurados y optimizados</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Sonidos y música de fondo implementados</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Sistema de puntos y vidas funcional</span>
                  </li>
                </ul>
              </div>

              <!-- Hito 4 -->
              <div
                class="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border-l-4 border-primary"
              >
                <h4 class="text-lg font-semibold mb-2 flex items-center">
                  <UIcon name="i-heroicons-flag" class="mr-2 text-primary" />
                  Hito 4: Entrega Final
                </h4>
                <ul class="space-y-2 mt-3">
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Todas las correcciones solicitadas implementadas</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Sistema de menú completo con: pantalla de inicio/portada,
                      instrucciones del juego y créditos</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Soporte para pantalla completa</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Pulido final de todos los elementos del juego</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 5: Criterios de Evaluación -->
        <div
          id="evaluacion"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Criterios de Evaluación</h2>
          <div class="prose dark:prose-invert max-w-none mb-6">
            <p>
              Los juegos serán evaluados por un panel de jueces según los
              siguientes criterios:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(criterion, index) in evaluationCriteria"
              :key="index"
              class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold">{{ criterion.name }}</h3>
                <UBadge color="primary">{{ criterion.weight }}%</UBadge>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ criterion.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sección 7: Propiedad Intelectual -->
        <div
          id="propiedad"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Propiedad Intelectual</h2>
          <div class="prose dark:prose-invert max-w-none">
            <p>
              Los participantes mantienen la propiedad intelectual de sus
              juegos. Sin embargo, al participar en la competencia, otorgan al
              Instituto Profesional Santo Tomás una licencia no exclusiva para
              exhibir, promover y publicar los juegos en la plataforma de la
              competencia y en eventos relacionados.
            </p>

            <p>
              Los participantes deben garantizar que todo el contenido de sus
              juegos:
            </p>

            <ul>
              <li>Es original o cuenta con las licencias correspondientes</li>
              <li>No infringe derechos de propiedad intelectual de terceros</li>
              <li>
                No contiene material ofensivo, discriminatorio o inapropiado
              </li>
            </ul>

            <p>
              Los juegos ganadores podrán ser presentados en futuros eventos
              institucionales, siempre reconociendo la autoría original de los
              desarrolladores.
            </p>
          </div>
        </div>

        <!-- Sección 8: Consultas y Contacto -->
        <div
          id="contacto"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Consultas y Contacto</h2>
          <div class="prose dark:prose-invert max-w-none mb-6">
            <p>
              Para cualquier duda o consulta relacionada con la competencia,
              puedes contactar al comité organizador a través de los siguientes
              canales:
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <UIcon
                name="i-heroicons-envelope"
                class="mr-3 text-primary flex-shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">Correo Electrónico</h3>
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
                class="mr-3 text-primary flex-shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">Coordinador</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  Prof. Ricardo Inostroza Rebolledo
                </p>
              </div>
            </div>

            <div
              class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <UIcon
                name="i-heroicons-question-mark-circle"
                class="mr-3 text-primary flex-shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">FAQ</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  <NuxtLink to="/faq" class="text-primary hover:underline">
                    Revisa nuestras preguntas frecuentes
                  </NuxtLink>
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <UButton to="/registro" color="primary" block size="lg">
              <template #leading>
                <UIcon name="i-heroicons-user-plus" />
              </template>
              Regístrate para participar
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import GameCraftConcept from "~/components/GameCraftConcept.vue";

// Definición de metadatos para SEO
definePageMeta({
  title: "Bases del Concurso",
  description:
    "Bases oficiales del concurso GameCraft2025 - Competencia de desarrollo de videojuegos",
  middleware: ["auth"],
});

// Lista de secciones para el índice
const sections = [
  { id: "descripcion", title: "Descripción del Concurso" },
  { id: "requisitos", title: "Requisitos de Participación" },
  { id: "plazos", title: "Plazos y Fechas" },
  { id: "especificaciones", title: "Especificaciones Técnicas" },
  { id: "evaluacion", title: "Criterios de Evaluación" },
  { id: "propiedad", title: "Propiedad Intelectual" },
  { id: "contacto", title: "Consultas y Contacto" },
];

// Fases del concurso
const phases = [
  {
    name: "Hito 1",
    description:
      "Período para registrarse en la plataforma y reservar una temática para el desarrollo del juego.",
    date: "12 de mayo - 14 de mayo, 2024",
  },
  {
    name: "Hito 2: Primera Revisión",
    description:
      "Presentación del juego con interfaz básica que permita el control del personaje, escenario inicial, personaje principal con animaciones, controles en pantalla y mediante teclado.",
    date: "28 de mayo - 29 de mayo, 2024",
  },
  {
    name: "Hito 3: Segunda Revisión",
    description:
      "Escenario terminado, controles de juego depurados, sonidos y música de fondo, sistema de puntos y vidas implementados.",
    date: "11 de junio - 12 de junio, 2024",
  },
  {
    name: "Hito 4: Entrega Final y Publicación de Proyectos",
    description:
      "Versión final con correcciones solicitadas, sistema de menú completo, instrucciones, portada, créditos, soporte para pantalla completa y cumplimiento del tiempo mínimo de jugabilidad.",
    date: "23 de junio, 2024",
  },
  {
    name: "Hito 5: Evaluación del Público",
    description: "Período en que el público evaluará los juegos presentados.",
    date: "23 de junio - 30 de junio, 2024",
  },
  {
    name: "Anuncio de Ganadores",
    description: "Ceremonia de premiación y anuncio oficial de los ganadores.",
    date: "1 de julio, 2024",
  },
];

// Criterios de evaluación
const evaluationCriteria = [
  {
    name: "Originalidad y creatividad",
    description:
      "Valoración de la propuesta creativa, innovación y originalidad del concepto.",
    weight: 25,
  },
  {
    name: "Implementación de la temática chilena",
    description:
      "Efectividad en la representación e integración de la temática chilena seleccionada.",
    weight: 20,
  },
  {
    name: "Jugabilidad",
    description:
      "Calidad de la experiencia de juego, controles intuitivos y diversión.",
    weight: 20,
  },
  {
    name: "Calidad técnica",
    description:
      "Ausencia de errores, optimización, tiempos de carga y rendimiento general.",
    weight: 15,
  },
  {
    name: "Diseño visual y sonoro",
    description:
      "Calidad de gráficos, interfaz de usuario, efectos visuales y audio.",
    weight: 10,
  },
  {
    name: "Documentación",
    description:
      "Calidad de las instrucciones, documentación técnica y presentación del proyecto.",
    weight: 10,
  },
];

// Función para hacer scroll suave a una sección
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
</script>
