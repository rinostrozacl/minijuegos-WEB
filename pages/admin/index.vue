<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Panel de Administración</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Resumen de configuración -->
      <UCard
        class="hover:shadow-lg transition-shadow"
        :ui="{ ring: '', divide: '', body: { padding: 'p-0' } }"
      >
        <div
          class="p-4 bg-primary-50 dark:bg-primary-950 border-b border-primary-200 dark:border-primary-800"
        >
          <div class="flex items-center space-x-3">
            <div class="bg-primary-100 dark:bg-primary-900 p-2 rounded-md">
              <UIcon
                name="i-heroicons-cog-6-tooth"
                class="text-primary h-6 w-6"
              />
            </div>
            <h3 class="text-lg font-semibold">Configuración</h3>
          </div>
        </div>

        <div class="p-4">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Fase actual:</span
              >
              <DisplayPhaseIndicator
                :phase="systemConfig.currentPhase"
                variant="soft"
              />
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Registro de usuarios:</span
              >
              <UBadge
                :color="systemConfig.isRegistrationEnabled ? 'green' : 'red'"
                size="sm"
                variant="soft"
              >
                {{
                  systemConfig.isRegistrationEnabled
                    ? "Habilitado"
                    : "Deshabilitado"
                }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Reserva de temáticas:</span
              >
              <UBadge
                :color="systemConfig.isReservationEnabled ? 'green' : 'red'"
                size="sm"
                variant="soft"
              >
                {{
                  systemConfig.isReservationEnabled
                    ? "Habilitada"
                    : "Deshabilitada"
                }}
              </UBadge>
            </div>
          </div>

          <UDivider class="my-3" />

          <UButton
            to="/admin/configuracion"
            variant="ghost"
            color="primary"
            block
            class="mt-2"
          >
            <template #leading>
              <UIcon name="i-heroicons-pencil-square" />
            </template>
            Editar configuración
          </UButton>
        </div>
      </UCard>

      <!-- Resumen de usuarios -->
      <UCard
        class="hover:shadow-lg transition-shadow"
        :ui="{ ring: '', divide: '', body: { padding: 'p-0' } }"
      >
        <div
          class="p-4 bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-200 dark:border-indigo-800"
        >
          <div class="flex items-center space-x-3">
            <div class="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-md">
              <UIcon
                name="i-heroicons-users"
                class="text-indigo-600 dark:text-indigo-400 h-6 w-6"
              />
            </div>
            <h3 class="text-lg font-semibold">Usuarios</h3>
          </div>
        </div>

        <div class="p-4">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Total de usuarios:</span
              >
              <UBadge color="indigo" size="sm" variant="soft">
                {{ userStats.total || 0 }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Administradores:</span
              >
              <UBadge color="indigo" size="sm" variant="soft">
                {{ userStats.admins || 0 }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Estudiantes:</span
              >
              <UBadge color="indigo" size="sm" variant="soft">
                {{ userStats.students || 0 }}
              </UBadge>
            </div>
          </div>

          <UDivider class="my-3" />

          <UButton
            to="/admin/usuarios"
            variant="ghost"
            color="indigo"
            block
            class="mt-2"
          >
            <template #leading>
              <UIcon name="i-heroicons-user-group" />
            </template>
            Gestionar usuarios
          </UButton>
        </div>
      </UCard>

      <!-- Resumen de temáticas -->
      <UCard
        class="hover:shadow-lg transition-shadow"
        :ui="{ ring: '', divide: '', body: { padding: 'p-0' } }"
      >
        <div
          class="p-4 bg-violet-50 dark:bg-violet-950 border-b border-violet-200 dark:border-violet-800"
        >
          <div class="flex items-center space-x-3">
            <div class="bg-violet-100 dark:bg-violet-900 p-2 rounded-md">
              <UIcon
                name="i-heroicons-tag"
                class="text-violet-600 dark:text-violet-400 h-6 w-6"
              />
            </div>
            <h3 class="text-lg font-semibold">Temáticas</h3>
          </div>
        </div>

        <div class="p-4">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Total de temáticas:</span
              >
              <UBadge color="violet" size="sm" variant="soft">
                {{ themeStats.total || 0 }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Reservadas:</span
              >
              <UBadge color="violet" size="sm" variant="soft">
                {{ themeStats.reserved || 0 }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Disponibles:</span
              >
              <UBadge color="violet" size="sm" variant="soft">
                {{ themeStats.available || 0 }}
              </UBadge>
            </div>
          </div>

          <UDivider class="my-3" />

          <UButton
            to="/admin/tematicas"
            variant="ghost"
            color="violet"
            block
            class="mt-2"
          >
            <template #leading>
              <UIcon name="i-heroicons-squares-2x2" />
            </template>
            Gestionar temáticas
          </UButton>
        </div>
      </UCard>
    </div>

    <UAlert
      title="Bienvenido al panel de administración"
      description="Desde aquí podrás gestionar todos los aspectos del concurso GameCraft2025."
      color="primary"
      variant="soft"
      icon="i-heroicons-information-circle"
      class="mb-8"
    />

    <!-- Acciones rápidas -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Acciones rápidas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton
          to="/admin/configuracion"
          color="primary"
          variant="soft"
          block
          class="h-auto py-4"
        >
          <div class="flex flex-col items-center">
            <UIcon name="i-heroicons-cog-6-tooth" class="mb-2 h-6 w-6" />
            <span>Configuración</span>
          </div>
        </UButton>

        <UButton
          to="/admin/usuarios"
          color="indigo"
          variant="soft"
          block
          class="h-auto py-4"
        >
          <div class="flex flex-col items-center">
            <UIcon name="i-heroicons-users" class="mb-2 h-6 w-6" />
            <span>Usuarios</span>
          </div>
        </UButton>

        <UButton
          to="/admin/tematicas"
          color="violet"
          variant="soft"
          block
          class="h-auto py-4"
        >
          <div class="flex flex-col items-center">
            <UIcon name="i-heroicons-tag" class="mb-2 h-6 w-6" />
            <span>Temáticas</span>
          </div>
        </UButton>

        <UButton
          to="/admin/juegos"
          color="amber"
          variant="soft"
          block
          class="h-auto py-4"
        >
          <div class="flex flex-col items-center">
            <UIcon name="i-heroicons-play" class="mb-2 h-6 w-6" />
            <span>Juegos</span>
          </div>
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
  layout: "admin",
});

const { config: systemConfig, loadConfig } = useSystemConfig();

// Estadísticas simuladas (en una implementación real se obtendrían de Firestore)
const userStats = ref({
  total: 24,
  admins: 3,
  students: 21,
});

const themeStats = ref({
  total: 15,
  reserved: 8,
  available: 7,
});

// Cargar configuración al montar el componente
onMounted(async () => {
  await loadConfig();
});
</script>
