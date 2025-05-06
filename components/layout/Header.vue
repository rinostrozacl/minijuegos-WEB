<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 font-bold text-xl text-primary"
        >
          <UIcon name="i-heroicons-play" class="text-2xl" />
          <span>EVA Videojuegos</span>
        </NuxtLink>

        <!-- Navegación escritorio -->
        <nav class="hidden md:flex space-x-6">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition"
            active-class="text-primary font-medium"
          >
            <UIcon :name="item.icon" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Acciones -->
        <div class="hidden md:flex items-center space-x-4">
          <UButton
            to="/ingresar"
            variant="ghost"
            color="gray"
            class="dark:text-gray-300"
          >
            Iniciar sesión
          </UButton>
          <UButton to="/registro" color="primary"> Registrarse </UButton>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-moon"
            class="ml-2"
            aria-label="Modo oscuro"
          />
        </div>

        <!-- Botón menú móvil -->
        <div class="md:hidden flex items-center">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-bars-3"
            class="mr-1"
            aria-label="Menú"
            @click="isMenuOpen = !isMenuOpen"
          />
        </div>
      </div>
    </div>

    <!-- Menú móvil -->
    <div
      v-show="isMenuOpen"
      class="md:hidden bg-white dark:bg-gray-800 shadow-lg"
    >
      <div class="container mx-auto px-4 py-4 space-y-4">
        <nav class="flex flex-col space-y-3">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            active-class="bg-gray-100 dark:bg-gray-700 text-primary font-medium"
            @click="isMenuOpen = false"
          >
            <UIcon :name="item.icon" class="flex-shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div
          class="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          <UButton to="/ingresar" block> Iniciar sesión </UButton>
          <UButton to="/registro" color="primary" block> Registrarse </UButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);

const navigationItems = [
  {
    label: "Inicio",
    icon: "i-heroicons-home",
    to: "/",
  },
  {
    label: "Juegos",
    icon: "i-heroicons-play",
    to: "/juegos",
  },
  {
    label: "Temáticas",
    icon: "i-heroicons-squares-2x2",
    to: "/tematicas",
  },
  {
    label: "Bases",
    icon: "i-heroicons-document-text",
    to: "/bases",
  },
  {
    label: "FAQ",
    icon: "i-heroicons-question-mark-circle",
    to: "/faq",
  },
];
</script>
