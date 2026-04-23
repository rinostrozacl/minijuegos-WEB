<template>
  <footer class="bg-gray-100 dark:bg-gray-900 pt-8 pb-6">
    <div class="container mx-auto px-4">
      <!-- Sección principal del footer -->
      <div class="flex flex-wrap mb-6">
        <!-- Columna de información del proyecto -->
        <div class="w-full md:w-1/3 mb-6 md:mb-0">
          <h5 class="text-xl font-bold mb-4">GameCraft2026</h5>
          <p class="mb-4 text-gray-600 dark:text-gray-400">
            Plataforma para la competencia universitaria de desarrollo de
            videojuegos que combina la creatividad y artesanía del desarrollo de
            juegos.
          </p>
          <div class="flex space-x-3">
            <UButton color="gray" variant="ghost" aria-label="GitHub">
              <Icon name="simple-icons:github" />
            </UButton>
            <UButton color="gray" variant="ghost" aria-label="Twitter">
              <Icon name="simple-icons:twitter" />
            </UButton>
            <UButton color="gray" variant="ghost" aria-label="Instagram">
              <Icon name="simple-icons:instagram" />
            </UButton>
          </div>
        </div>

        <!-- Columna de enlaces útiles -->
        <div class="w-full md:w-1/3 mb-6 md:mb-0">
          <h5 class="text-xl font-bold mb-4">Enlaces útiles</h5>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/bases"
                class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400"
              >
                Bases del concurso
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/tematicas"
                class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400"
              >
                Temáticas disponibles
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/faq"
                class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400"
              >
                Preguntas frecuentes
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/contacto"
                class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400"
              >
                Contacto
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Columna de contacto -->
        <div class="w-full md:w-1/3">
          <h5 class="text-xl font-bold mb-4">Contacto</h5>
          <ul class="space-y-2">
            <li class="flex items-start">
              <Icon
                name="heroicons:envelope"
                class="mr-2 w-5 h-5 text-gray-600 dark:text-gray-400"
              />
              <span class="text-gray-600 dark:text-gray-400"
                >contacto@codepulse.cl</span
              >
            </li>
            <li class="flex items-start">
              <Icon
                name="heroicons:map-pin"
                class="mr-2 w-5 h-5 text-gray-600 dark:text-gray-400"
              />
              <span class="text-gray-600 dark:text-gray-400"
                >Puerto Montt, Chile</span
              >
            </li>
            <li class="flex items-start">
              <Icon
                name="heroicons:academic-cap"
                class="mr-2 w-5 h-5 text-gray-600 dark:text-gray-400"
              />
              <span class="text-gray-600 dark:text-gray-400">Santo Tomás</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Separador -->
      <hr class="border-gray-200 dark:border-gray-700 my-6" />

      <!-- Derechos de autor -->
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          &copy; {{ currentYear }} GameCraft2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useIcons } from "~/composables/useIcons";

const { icons } = useIcons();
const currentYear = new Date().getFullYear();
</script>
