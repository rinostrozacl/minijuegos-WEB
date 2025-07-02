<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-4">Bases del Concurso</h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Información oficial sobre las reglas, plazos y condiciones para
          participar en GameCraft2025, la competencia de desarrollo de
          videojuegos.
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
                    <span>Correspondencia con el concepto solicitado</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Portada en Game Craft con título, descripción y captura
                      de pantalla</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Documento de diseño básico con mecánicas y
                      objetivos</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Personaje principal con animaciones básicas</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Controles funcionales en pantalla táctil y teclado</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Escenario inicial con elementos básicos</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Sistema de colisiones básico</span>
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
                    <span
                      >Escenario completamente terminado con todos los
                      niveles</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Interfaz de usuario (HUD) completa</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Elementos visuales adicionales y efectos</span>
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
                    <span>Controles depurados con respuesta consistente</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Dificultad balanceada a través de los niveles</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Sistema de puntos y vidas funcional</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Guardado de progreso entre sesiones</span>
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
                    <span>Ausencia de errores y crashes</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Optimización (mínimo 30 FPS en plataformas
                      objetivo)</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Sistema de menú completo (inicio, opciones,
                      instrucciones, créditos)</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span
                      >Soporte para pantalla completa con adaptación a
                      diferentes resoluciones</span
                    >
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Manual de usuario completo</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Capturas y video demostrativo</span>
                  </li>
                  <li class="flex items-start">
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="text-primary mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span>Código comentado y organizado</span>
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
              siguientes criterios para cada hito:
            </p>
          </div>

          <!-- Pestañas para los criterios por hito -->
          <UTabs :items="evaluationTabs" class="mb-6">
            <template #item="{ item }">
              <div class="space-y-6 p-4">
                <div v-if="item.value === 'general'">
                  <!-- Criterios generales -->
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

                <div v-else-if="item.value === 'hito2'">
                  <!-- Criterios Hito 2 -->
                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Concepto y Diseño (40 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Correspondencia con el concepto solicitado
                          </h4>
                          <UBadge color="primary">20 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          El juego implementa correctamente todas las mecánicas
                          y elementos definidos en los requerimientos, sin
                          omisiones.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Portada en Game Craft</h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Portada subida correctamente en la plataforma Game
                          Craft, incluye título, descripción, captura de
                          pantalla representativa y nombres de autores.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Documento de diseño básico
                          </h4>
                          <UBadge color="primary">5 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Documento que incluye diagrama de flujo del juego,
                          listado de mecánicas principales y objetivos
                          claramente definidos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Desarrollo Técnico (30 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Personaje principal</h4>
                          <UBadge color="primary">20 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Personaje con sprite/modelo completo, implementación
                          de al menos 3 animaciones básicas (idle, movimiento,
                          acción) y correcta integración en el motor de juego.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Controles del juego</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Implementación verificable de controles en pantalla
                          táctil y teclado, con tiempo de respuesta adecuado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Implementación del Escenario (30 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Escenario inicial</h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Primer nivel implementado con todos los elementos
                          básicos requeridos (plataformas, obstáculos, límites,
                          elementos interactivos).
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Colisiones y física</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Sistema de colisiones que detecta correctamente
                          interacciones entre el personaje y todos los elementos
                          del escenario.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Coherencia visual</h4>
                          <UBadge color="primary">5 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Paleta de colores consistente, proporciones adecuadas
                          entre elementos y estilo gráfico unificado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="item.value === 'hito3'">
                  <!-- Criterios Hito 3 -->
                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Desarrollo Visual y Sonoro (35 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Escenario completamente terminado
                          </h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Todos los niveles implementados con detalles visuales
                          completos según el diseño aprobado.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Interfaz de usuario (HUD)
                          </h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          HUD que muestra claramente puntuación, vidas/salud y
                          otros indicadores relevantes, con diseño coherente con
                          la estética del juego.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Elementos visuales adicionales
                          </h4>
                          <UBadge color="primary">5 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Al menos 3 efectos visuales o animaciones adicionales
                          que respondan a acciones del jugador o eventos del
                          juego.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Sonidos y música</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Implementación de al menos 5 efectos de sonido para
                          acciones principales y música de fondo apropiada para
                          la temática.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Experiencia de Juego (30 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Controles depurados</h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Respuesta consistente de los controles en todas las
                          plataformas (menos de 100ms de latencia), sin fallos
                          de detección.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Dificultad balanceada</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Progresión verificable de dificultad a través de los
                          niveles, con curva de dificultad gradual y
                          documentada.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Retroalimentación al jugador
                          </h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Sistema de feedback que incluye indicadores
                          visuales/sonoros para aciertos, errores y logros del
                          jugador.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Sistemas de Juego (25 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Sistema de puntos</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Sistema de puntuación con reglas claras, visualización
                          en pantalla y registro de puntuación máxima.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Sistema de vidas o salud
                          </h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Mecánica de vidas/salud funcional con indicadores
                          visuales claros y reglas de pérdida/ganancia
                          definidas.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Guardado de progreso</h4>
                          <UBadge color="primary">5 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Sistema que guarda correctamente el estado del juego
                          (nivel, puntuación, vidas) entre sesiones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="item.value === 'hito4'">
                  <!-- Criterios Hito 4 -->
                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Calidad General (40 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Correcciones implementadas
                          </h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Todas las correcciones solicitadas en revisiones
                          anteriores están implementadas y documentadas.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Ausencia de errores</h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          El juego no presenta errores, crashes o
                          comportamientos inesperados en al menos 15 minutos de
                          juego continuo.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Optimización</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          El juego mantiene una tasa de fotogramas estable
                          (mínimo 30 FPS) en las plataformas objetivo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Sistemas Completos (40 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Sistema de menú completo
                          </h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Implementación de pantalla de inicio/portada, menú de
                          opciones funcional, sección de instrucciones completa
                          y créditos con todos los contribuyentes.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Soporte para pantalla completa
                          </h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Funcionamiento verificable en modo pantalla completa,
                          con adaptación correcta a al menos 3 resoluciones
                          diferentes.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Integración completa</h4>
                          <UBadge color="primary">15 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Todos los sistemas del juego (puntuación, vidas,
                          niveles, guardado) funcionan correctamente integrados
                          sin errores.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h3 class="text-xl font-medium mb-2">
                      Documentación y Entregables (20 puntos)
                    </h3>
                    <div class="space-y-3">
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">Manual de usuario</h4>
                          <UBadge color="primary">10 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Documento que explica todos los controles, mecánicas y
                          objetivos del juego de forma clara y completa.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Capturas y video demostrativo
                          </h4>
                          <UBadge color="primary">5 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Conjunto de al menos 5 capturas representativas y
                          video de 1-2 minutos mostrando la jugabilidad
                          principal.
                        </p>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                          <h4 class="font-semibold">
                            Código comentado y organizado
                          </h4>
                          <UBadge color="primary">5 puntos</UBadge>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                          Código fuente con comentarios explicativos en las
                          secciones principales y estructura organizada según
                          las buenas prácticas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UTabs>

          <div
            class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-primary mt-4"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-information-circle"
                class="w-5 h-5 text-primary mr-3 mt-0.5"
              />
              <div>
                <p class="text-sm">
                  Cada hito será evaluado sobre 100 puntos. La nota final será
                  el promedio ponderado de las evaluaciones de los hitos 2, 3 y
                  4.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 6: Premios -->
        <div
          id="premios"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 class="text-2xl font-semibold mb-4">Premios</h2>
          <div class="prose dark:prose-invert max-w-none mb-6">
            <p>
              Los mejores proyectos serán premiados en una ceremonia de
              reconocimiento al finalizar la competencia.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Segundo lugar -->
            <UCard class="order-md-1 order-2">
              <template #header>
                <div
                  class="flex items-center justify-center py-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div
                    class="w-16 h-16 rounded-full bg-silver flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-trophy"
                      class="w-8 h-8 text-white"
                    />
                  </div>
                </div>
              </template>
              <div class="text-center p-4">
                <h3 class="text-xl font-bold mb-2">Segundo Lugar</h3>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Reconocimiento a la segunda mejor propuesta
                </div>
                <div class="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
                <div class="text-center text-lg font-semibold text-primary">
                  Premio Sorpresa
                </div>
              </div>
            </UCard>

            <!-- Primer lugar -->
            <UCard
              class="order-md-2 order-1 transform md:scale-110 z-10 border-2 border-primary"
            >
              <template #header>
                <div
                  class="flex items-center justify-center py-6 bg-primary/10"
                >
                  <div
                    class="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-trophy"
                      class="w-10 h-10 text-white"
                    />
                  </div>
                </div>
                <UBadge
                  color="primary"
                  variant="solid"
                  class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3"
                >
                  Gran Premio
                </UBadge>
              </template>
              <div class="text-center p-4">
                <h3 class="text-2xl font-bold mb-2">Primer Lugar</h3>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  El mejor proyecto de la competencia
                </div>
                <div class="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
                <div class="flex flex-col items-center">
                  <div class="text-3xl font-bold text-primary">$50.000</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    pesos chilenos
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Tercer lugar -->
            <UCard class="order-md-3 order-3">
              <template #header>
                <div
                  class="flex items-center justify-center py-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div
                    class="w-16 h-16 rounded-full bg-bronze flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-trophy"
                      class="w-8 h-8 text-white"
                    />
                  </div>
                </div>
              </template>
              <div class="text-center p-4">
                <h3 class="text-xl font-bold mb-2">Tercer Lugar</h3>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Reconocimiento a la tercera mejor propuesta
                </div>
                <div class="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
                <div class="text-center text-lg font-semibold text-primary">
                  Premio Sorpresa
                </div>
              </div>
            </UCard>
          </div>

          <div
            class="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-primary"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-information-circle"
                class="w-5 h-5 text-primary mr-3 mt-0.5"
              />
              <div>
                <p class="text-sm">
                  La ceremonia de premiación se realizará el
                  <strong>1 de julio de 2024</strong>. Todos los participantes
                  recibirán certificados de participación.
                </p>
              </div>
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
    "Información oficial sobre las reglas, plazos y condiciones para participar en GameCraft2025",
  middleware: ["auth"],
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
    name: "Hito 1",
    description:
      "Período para registrarse en la plataforma y reservar una temática para el desarrollo del juego.",
    date: "12 de mayo - 14 de mayo, 2024",
  },
  {
    name: "Hito 2: Primera Revisión",
    description:
      "Presentación del juego con interfaz básica que permita el control del personaje, escenario inicial, personaje principal con animaciones, controles en pantalla y mediante teclado.",
    date: "3 de junio - 5 de junio, 2024",
  },
  {
    name: "Hito 3: Segunda Revisión",
    description:
      "Escenario terminado, controles de juego depurados, sonidos y música de fondo, sistema de puntos y vidas implementados.",
    date: "17 de junio - 18 de junio, 2024",
  },
  {
    name: "Hito 4: Entrega Final y Publicación de Proyectos",
    description:
      "Versión final con correcciones solicitadas, sistema de menú completo, instrucciones, portada, créditos, soporte para pantalla completa y cumplimiento del tiempo mínimo de jugabilidad.",
    date: "25 de junio - 26 de junio, 2024",
  },
  {
    name: "Hito 5: Evaluación del Público",
    description: "Período en que el público evaluará los juegos presentados.",
    date: "26 de junio - 30 de junio, 2024",
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

// Pestañas para los criterios de evaluación
const evaluationTabs = [
  { name: "Criterios Generales", value: "general" },
  { name: "Hito 2: Primera Revisión", value: "hito2" },
  { name: "Hito 3: Segunda Revisión", value: "hito3" },
  { name: "Hito 4: Entrega Final", value: "hito4" },
];

// Función para hacer scroll suave a una sección
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped>
.bg-silver {
  background-color: #a7a7ad;
}

.bg-bronze {
  background-color: #ad8a56;
}
</style>
