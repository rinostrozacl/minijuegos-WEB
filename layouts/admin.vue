<template>
  <div class="admin-layout min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Barra superior -->
    <div class="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <NuxtLink to="/admin" class="flex items-center space-x-2">
            <UIcon
              name="i-heroicons-squares-2x2"
              class="text-primary h-6 w-6"
            />
            <span class="font-bold text-lg text-gray-900 dark:text-white"
              >Panel de Administración</span
            >
          </NuxtLink>

          <div class="flex items-center space-x-4">
            <UButton
              variant="ghost"
              color="gray"
              to="/"
              class="flex items-center space-x-1"
            >
              <UIcon name="i-heroicons-arrow-left-circle" />
              <span>Volver al sitio</span>
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Menú lateral -->
        <div class="w-full md:w-64 shrink-0">
          <UCard class="sticky top-6">
            <nav>
              <ul class="space-y-1">
                <li>
                  <NuxtLink
                    to="/admin"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    active-class="bg-gray-100 dark:bg-gray-700 text-primary"
                  >
                    <UIcon name="i-heroicons-home" />
                    <span>Inicio</span>
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/admin/configuracion"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    active-class="bg-gray-100 dark:bg-gray-700 text-primary"
                  >
                    <UIcon name="i-heroicons-cog-6-tooth" />
                    <span>Configuración</span>
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/admin/usuarios"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    active-class="bg-gray-100 dark:bg-gray-700 text-primary"
                  >
                    <UIcon name="i-heroicons-users" />
                    <span>Usuarios</span>
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/admin/tematicas"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    active-class="bg-gray-100 dark:bg-gray-700 text-primary"
                  >
                    <UIcon name="i-heroicons-tag" />
                    <span>Temáticas</span>
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/admin/juegos"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    active-class="bg-gray-100 dark:bg-gray-700 text-primary"
                  >
                    <UIcon name="i-heroicons-play" />
                    <span>Juegos</span>
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </UCard>
        </div>

        <!-- Contenido principal -->
        <div class="flex-1">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
});
</script>
