<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Bases del Concurso</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Información oficial sobre las reglas, plazos y condiciones para
          participar en la competencia de minijuegos con temáticas chilenas.
        </p>
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
              La competencia de minijuegos con temáticas chilenas es una
              iniciativa organizada por el Instituto Profesional Santo Tomás,
              destinada a fomentar el desarrollo de videojuegos que promuevan
              aspectos culturales, históricos, geográficos o naturales de Chile.
            </p>
            <p>
              Los participantes deberán desarrollar un minijuego web utilizando
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
                Estar matriculado en la carrera de Ingeniería en Informática o
                Analista Programador
              </li>
              <li>
                Registrarse en la plataforma de la competencia usando el correo
                institucional (@alumnos.santotomas.cl)
              </li>
              <li>Seleccionar y reservar una temática en la plataforma</li>
              <li>
                Desarrollar el juego de forma individual o en equipo (máximo 3
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
          <div class="prose dark:prose-invert max-w-none">
            <p>
              Los juegos presentados deben cumplir con las siguientes
              especificaciones técnicas:
            </p>
            <ul>
              <li>
                Debe ser compatible con navegadores web modernos y ejecutarse
                mediante WebGL
              </li>
              <li>Peso máximo del juego: 50MB</li>
              <li>
                Compatibilidad con resoluciones desde 800x600 hasta 1920x1080
              </li>
              <li>Debe implementar un sistema de puntuación o progresión</li>
              <li>Tiempo de juego mínimo: 3 minutos</li>
              <li>Debe incluir instrucciones claras dentro del juego</li>
              <li>
                Debe representar correctamente la temática chilena seleccionada
              </li>
            </ul>

            <h3>Tecnologías permitidas</h3>
            <ul>
              <li>Unity (exportación WebGL)</li>
              <li>Unreal Engine (exportación HTML5)</li>
              <li>Godot Engine</li>
              <li>Three.js</li>
              <li>Phaser.js</li>
              <li>Pixi.js</li>
              <li>
                Cualquier otro framework o herramienta que genere contenido
                WebGL compatible
              </li>
            </ul>
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

        <!-- Sección 6: Premios -->
        <div
          id="premios"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Premios</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              class="bg-gradient-to-b from-amber-500 to-yellow-500 rounded-lg shadow-lg p-6 text-center text-white"
            >
              <div class="text-xl font-bold mb-1">Segundo lugar</div>
              <UIcon name="i-heroicons-trophy" class="w-16 h-16 mx-auto my-4" />
              <div class="font-bold text-2xl mb-2">$150.000</div>
              <div class="text-sm opacity-80">
                + Certificado de reconocimiento
              </div>
            </div>

            <div
              class="bg-gradient-to-b from-primary-500 to-indigo-600 rounded-lg shadow-lg p-6 text-center text-white transform md:-translate-y-4"
            >
              <div class="text-xl font-bold mb-1">Primer lugar</div>
              <UIcon name="i-heroicons-trophy" class="w-20 h-20 mx-auto my-4" />
              <div class="font-bold text-3xl mb-2">$300.000</div>
              <div class="text-sm opacity-80">
                + Publicación en plataforma oficial
              </div>
              <div class="text-sm opacity-80">
                + Certificado de reconocimiento
              </div>
            </div>

            <div
              class="bg-gradient-to-b from-orange-600 to-amber-700 rounded-lg shadow-lg p-6 text-center text-white"
            >
              <div class="text-xl font-bold mb-1">Tercer lugar</div>
              <UIcon name="i-heroicons-trophy" class="w-16 h-16 mx-auto my-4" />
              <div class="font-bold text-2xl mb-2">$75.000</div>
              <div class="text-sm opacity-80">
                + Certificado de reconocimiento
              </div>
            </div>
          </div>

          <div
            class="mt-6 text-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
          >
            <h3 class="font-semibold mb-2">Mención honorífica</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Se otorgará una mención honorífica al juego más innovador, que
              recibirá un kit de merchandising institucional y la oportunidad de
              exhibir su juego en la muestra anual de proyectos.
            </p>
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
                  concurso.minijuegos@santotomas.cl
                </p>
              </div>
            </div>

            <div
              class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <UIcon
                name="i-heroicons-chat-bubble-left-ellipsis"
                class="mr-3 text-primary flex-shrink-0"
              />
              <div>
                <h3 class="font-semibold mb-1">Discord</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  Canal #concurso-minijuegos en el servidor oficial
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
                  Prof. Alejandro Mendez - Oficina 305, Edificio C
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
// Definición de metadatos para SEO
definePageMeta({
  title: "Bases del Concurso",
  description:
    "Reglas y condiciones para participar en la competencia de minijuegos con temáticas chilenas",
});

// Lista de secciones para el índice
const sections = [
  { id: "descripcion", title: "Descripción del Concurso" },
  { id: "requisitos", title: "Requisitos de Participación" },
  { id: "plazos", title: "Plazos y Fechas" },
  { id: "especificaciones", title: "Especificaciones Técnicas" },
  { id: "evaluacion", title: "Criterios de Evaluación" },
  { id: "premios", title: "Premios" },
  { id: "propiedad", title: "Propiedad Intelectual" },
  { id: "contacto", title: "Consultas y Contacto" },
];

// Fases del concurso
const phases = [
  {
    name: "Inscripción y Reserva de Temática",
    description:
      "Período para registrarse en la plataforma y reservar una temática para el desarrollo del juego.",
    date: "15 de marzo - 15 de abril, 2024",
  },
  {
    name: "Desarrollo de Juegos",
    description:
      "Tiempo destinado al desarrollo del juego según la temática seleccionada.",
    date: "16 de abril - 30 de mayo, 2024",
  },
  {
    name: "Entrega de Proyectos",
    description:
      "Plazo final para subir los juegos terminados a la plataforma.",
    date: "31 de mayo, 2024 (hasta las 23:59 hrs)",
  },
  {
    name: "Evaluación de Juegos",
    description: "Período en que el jurado evaluará los juegos presentados.",
    date: "1 - 15 de junio, 2024",
  },
  {
    name: "Anuncio de Ganadores y Premiación",
    description: "Ceremonia de premiación y anuncio oficial de los ganadores.",
    date: "28 de junio, 2024",
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
