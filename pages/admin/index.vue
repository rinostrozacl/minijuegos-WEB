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
          <div v-if="isLoading" class="flex justify-center py-3">
            <div
              class="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"
            ></div>
          </div>
          <div v-else class="space-y-3">
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
          <div v-if="isLoading" class="flex justify-center py-3">
            <div
              class="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"
            ></div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Total de usuarios:</span
              >
              <UBadge color="indigo" size="sm" variant="soft">
                {{ userStats.total }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Administradores:</span
              >
              <UBadge color="indigo" size="sm" variant="soft">
                {{ userStats.admins }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Estudiantes:</span
              >
              <UBadge color="indigo" size="sm" variant="soft">
                {{ userStats.students }}
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
          <div v-if="isLoading" class="flex justify-center py-3">
            <div
              class="animate-spin h-5 w-5 border-2 border-violet-500 rounded-full border-t-transparent"
            ></div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Total de temáticas:</span
              >
              <UBadge color="violet" size="sm" variant="soft">
                {{ themeStats.total }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Reservadas:</span
              >
              <UBadge color="violet" size="sm" variant="soft">
                {{ themeStats.reserved }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Disponibles:</span
              >
              <UBadge color="violet" size="sm" variant="soft">
                {{ themeStats.available }}
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

      <!-- Resumen de juegos -->
      <UCard
        class="hover:shadow-lg transition-shadow"
        :ui="{ ring: '', divide: '', body: { padding: 'p-0' } }"
      >
        <div
          class="p-4 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800"
        >
          <div class="flex items-center space-x-3">
            <div class="bg-amber-100 dark:bg-amber-900 p-2 rounded-md">
              <UIcon
                name="i-heroicons-play"
                class="text-amber-600 dark:text-amber-400 h-6 w-6"
              />
            </div>
            <h3 class="text-lg font-semibold">Juegos</h3>
          </div>
        </div>

        <div class="p-4">
          <div v-if="isLoading" class="flex justify-center py-3">
            <div
              class="animate-spin h-5 w-5 border-2 border-amber-500 rounded-full border-t-transparent"
            ></div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Total de juegos:</span
              >
              <UBadge color="amber" size="sm" variant="soft">
                {{ gameStats.total }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >En progreso:</span
              >
              <UBadge color="amber" size="sm" variant="soft">
                {{ gameStats.inProgress }}
              </UBadge>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >Completados:</span
              >
              <UBadge color="amber" size="sm" variant="soft">
                {{ gameStats.completed }}
              </UBadge>
            </div>
          </div>

          <UDivider class="my-3" />

          <UButton
            to="/admin/juegos"
            variant="ghost"
            color="amber"
            block
            class="mt-2"
          >
            <template #leading>
              <UIcon name="i-heroicons-play" />
            </template>
            Gestionar juegos
          </UButton>
        </div>
      </UCard>
    </div>

    <UAlert
      title="Bienvenido al panel de administración"
      description="Desde aquí podrás gestionar todos los aspectos del concurso GameCraft2026."
      color="primary"
      variant="soft"
      icon="i-heroicons-information-circle"
      class="mb-8"
    />

    <!-- Acciones rápidas -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Acciones rápidas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

        <UButton
          to="/admin/calificaciones"
          color="emerald"
          variant="soft"
          block
          class="h-auto py-4"
        >
          <div class="flex flex-col items-center">
            <UIcon name="i-heroicons-star" class="mb-2 h-6 w-6" />
            <span>Calificaciones</span>
          </div>
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";

definePageMeta({
  middleware: ["admin"],
  layout: "admin",
});

const { config: systemConfig, loadConfig } = useSystemConfig();
const isLoading = ref(true);

// Estadísticas dinámicas de usuarios
const userStats = ref({
  total: 0,
  admins: 0,
  students: 0,
});

// Estadísticas dinámicas de temáticas
const themeStats = ref({
  total: 0,
  reserved: 0,
  available: 0,
});

// Estadísticas dinámicas de juegos
const gameStats = ref({
  total: 0,
  inProgress: 0,
  completed: 0,
});

// Cargar estadísticas desde Firestore
const loadStats = async () => {
  try {
    const { $firestore } = useNuxtApp();
    isLoading.value = true;

    if (!$firestore) {
      console.error("Firestore no está disponible");
      return;
    }

    // Cargar estadísticas de usuarios
    const usersCollection = collection($firestore, "users");
    const usersSnapshot = await getDocs(usersCollection);

    // Resetear contadores
    let totalUsers = 0;
    let adminUsers = 0;
    let studentUsers = 0;

    // Procesar documentos
    usersSnapshot.forEach((doc) => {
      totalUsers++;
      const userData = doc.data();
      if (userData.role === "admin") {
        adminUsers++;
      } else if (userData.role === "student") {
        studentUsers++;
      }
    });

    // Actualizar estadísticas de usuarios
    userStats.value = {
      total: totalUsers,
      admins: adminUsers,
      students: studentUsers,
    };

    // Cargar estadísticas de temáticas
    const themesCollection = collection($firestore, "themes");
    const themesSnapshot = await getDocs(themesCollection);

    // Resetear contadores
    let totalThemes = 0;
    let availableThemes = 0;
    let reservedThemes = 0;

    // Procesar documentos
    themesSnapshot.forEach((doc) => {
      totalThemes++;
      const themeData = doc.data();
      if (themeData.available) {
        availableThemes++;
      } else {
        reservedThemes++;
      }
    });

    // Actualizar estadísticas de temáticas
    themeStats.value = {
      total: totalThemes,
      available: availableThemes,
      reserved: reservedThemes,
    };

    // Cargar estadísticas de juegos (si existe la colección)
    try {
      const gamesCollection = collection($firestore, "games");
      const gamesSnapshot = await getDocs(gamesCollection);

      // Resetear contadores
      let totalGames = 0;
      let inProgressGames = 0;
      let completedGames = 0;

      // Procesar documentos
      gamesSnapshot.forEach((doc) => {
        totalGames++;
        const gameData = doc.data();
        if (gameData.status === "publicado") {
          completedGames++;
        } else {
          inProgressGames++;
        }
      });

      // Actualizar estadísticas de juegos
      gameStats.value = {
        total: totalGames,
        inProgress: inProgressGames,
        completed: completedGames,
      };
    } catch (gameError) {
      console.log("No se pudieron cargar estadísticas de juegos:", gameError);
      // Si no hay colección de juegos, simplemente dejamos los valores en 0
    }
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar configuración y estadísticas al montar el componente
onMounted(async () => {
  await Promise.all([loadConfig(), loadStats()]);
});
</script>
