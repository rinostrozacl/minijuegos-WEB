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
          <span>GameCraft2025</span>
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
          <!-- Si no está autenticado -->
          <template v-if="!isAuthenticated">
            <UButton
              to="/ingresar"
              variant="ghost"
              color="gray"
              class="dark:text-gray-300"
            >
              Iniciar sesión
            </UButton>
            <UButton to="/registro" color="primary"> Registrarse </UButton>
          </template>

          <!-- Si está autenticado -->
          <template v-else>
            <!-- Notificación de email no verificado -->
            <UButton
              v-if="!isEmailVerified"
              to="/verificar-email"
              variant="soft"
              color="amber"
              class="mr-2"
            >
              <template #leading>
                <UIcon name="i-heroicons-exclamation-triangle" />
              </template>
              Verificar Email
            </UButton>

            <!-- Menú de usuario -->
            <UDropdownMenu
              :items="userMenuItems"
              :popper="{ placement: 'bottom-end' }"
            >
              <UButton
                color="gray"
                variant="ghost"
                class="flex items-center space-x-2"
              >
                <UAvatar
                  :alt="user?.displayName || 'Usuario'"
                  size="sm"
                  :src="user?.photoURL || ''"
                  :text="getUserInitials(user?.displayName)"
                  class="mr-1"
                />
                <span class="max-w-32 truncate">{{
                  user?.displayName || "Usuario"
                }}</span>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 ml-1" />
              </UButton>
            </UDropdownMenu>
          </template>

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
          <!-- Si no está autenticado (móvil) -->
          <template v-if="!isAuthenticated">
            <UButton to="/ingresar" block> Iniciar sesión </UButton>
            <UButton to="/registro" color="primary" block>
              Registrarse
            </UButton>
          </template>

          <!-- Si está autenticado (móvil) -->
          <template v-else>
            <div class="flex items-center space-x-2 p-2 mb-2">
              <UAvatar
                :alt="user?.displayName || 'Usuario'"
                size="sm"
                :src="user?.photoURL || ''"
                :text="getUserInitials(user?.displayName)"
              />
              <span class="font-medium">{{
                user?.displayName || "Usuario"
              }}</span>
            </div>

            <UButton
              v-if="!isEmailVerified"
              to="/verificar-email"
              variant="soft"
              color="amber"
              block
              class="mb-2"
            >
              <template #leading>
                <UIcon name="i-heroicons-exclamation-triangle" />
              </template>
              Verificar Email
            </UButton>

            <!-- Opciones de usuario (móvil) -->
            <NuxtLink
              v-for="item in userMenuItems"
              :key="item.label"
              :to="item.to"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              @click="handleMobileMenuItemClick(item)"
            >
              <UIcon :name="item.icon" class="flex-shrink-0" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";

const isMenuOpen = ref(false);
const { user, isAuthenticated, isEmailVerified, logout } = useAuth();
const router = useRouter();

const navigationItems = computed(() => {
  // Elementos siempre visibles
  const items = [
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
  ];

  // FAQ siempre visible
  items.push({
    label: "FAQ",
    icon: "i-heroicons-question-mark-circle",
    to: "/faq",
  });

  return items;
});

const getUserInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Elementos del menú de usuario
const userMenuItems = computed(() => {
  const items = [
    {
      label: "Mi Perfil",
      icon: "i-heroicons-user",
      to: "/perfil",
    },
    {
      label: "Mis Juegos",
      icon: "i-heroicons-play",
      to: "/mis-juegos",
    },
  ];

  // Añadir opción de administración si es admin
  if (user.value?.email?.endsWith("@santotomas.cl")) {
    items.push({
      label: "Administración",
      icon: "i-heroicons-cog-6-tooth",
      to: "/admin",
    });
  }

  // Añadir opción de cerrar sesión
  items.push({
    label: "Cerrar Sesión",
    icon: "i-heroicons-arrow-right-on-rectangle",
    click: handleLogout,
  });

  return items;
});

// Manejar clic en cerrar sesión
const handleLogout = async () => {
  await logout();
  router.push("/");
  isMenuOpen.value = false;
};

// Manejar clic en elementos del menú móvil
const handleMobileMenuItemClick = (item) => {
  if (item.click) {
    item.click();
  }
  isMenuOpen.value = false;
};
</script>
