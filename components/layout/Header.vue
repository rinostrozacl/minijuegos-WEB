<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 font-bold text-xl text-primary"
        >
          <Icon name="heroicons:play" class="text-2xl" />
          <span>GameCraft2026</span>
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
            <Icon :name="getIconName(item.icon)" />
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
                <Icon name="heroicons:exclamation-triangle" />
              </template>
              Verificar Email
            </UButton>

            <!-- Menú de usuario -->
            <UDropdownMenu
              :items="userMenuItems"
              :ui="{ content: 'min-w-[200px]' }"
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
                <Icon name="heroicons:chevron-down" class="w-4 h-4 ml-1" />
              </UButton>
            </UDropdownMenu>
          </template>

          <UButton
            color="gray"
            variant="ghost"
            class="ml-2"
            aria-label="Modo oscuro"
          >
            <Icon name="heroicons:moon" />
          </UButton>
        </div>

        <!-- Botón menú móvil -->
        <div class="md:hidden flex items-center">
          <UButton
            color="gray"
            variant="ghost"
            class="mr-1"
            aria-label="Menú"
            @click="isMenuOpen = !isMenuOpen"
          >
            <Icon name="heroicons:bars-3" />
          </UButton>
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
            <Icon :name="getIconName(item.icon)" class="flex-shrink-0" />
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
                <Icon name="heroicons:exclamation-triangle" />
              </template>
              Verificar Email
            </UButton>

            <!-- Opciones de usuario (móvil) -->
            <div class="space-y-2">
              <!-- Mi Perfil -->
              <UButton
                to="/perfil"
                color="gray"
                variant="ghost"
                block
                class="justify-start text-left"
                @click="isMenuOpen = false"
              >
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:user" class="flex-shrink-0" />
                  <span>Mi Perfil</span>
                </div>
              </UButton>

              <!-- Mi Juego -->
              <UButton
                to="/mis-juegos"
                color="gray"
                variant="ghost"
                block
                class="justify-start text-left"
                @click="isMenuOpen = false"
              >
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:play" class="flex-shrink-0" />
                  <span>Mi Juego</span>
                </div>
              </UButton>

              <!-- Administración (solo si es admin) -->
              <UButton
                v-if="user?.email?.endsWith('@santotomas.cl')"
                to="/admin"
                color="gray"
                variant="ghost"
                block
                class="justify-start text-left"
                @click="isMenuOpen = false"
              >
                <div class="flex items-center space-x-2">
                  <Icon name="heroicons:cog-6-tooth" class="flex-shrink-0" />
                  <span>Administración</span>
                </div>
              </UButton>

              <!-- Cerrar Sesión -->
              <UButton
                color="gray"
                variant="ghost"
                block
                class="justify-start text-left mt-2"
                @click="handleLogout"
              >
                <div class="flex items-center space-x-2">
                  <Icon
                    name="heroicons:arrow-right-on-rectangle"
                    class="flex-shrink-0"
                  />
                  <span>Cerrar Sesión</span>
                </div>
              </UButton>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useIcons } from "~/composables/useIcons";

const isMenuOpen = ref(false);
const { user, isAuthenticated, isEmailVerified, logout } = useAuth();
const { getIconName } = useIcons();
const { $logoutUser } = useNuxtApp();
const router = useRouter();

const navigationItems = computed(() => {
  // Elementos siempre visibles
  const items = [
    {
      label: "Inicio",
      icon: "heroicons:home",
      to: "/",
    },
    {
      label: "Juegos",
      icon: "heroicons:play",
      to: "/juegos",
    },
  ];

  // Elementos visibles solo para usuarios autenticados
  if (isAuthenticated.value) {
    items.push({
      label: "Temáticas",
      icon: "heroicons:squares-2x2",
      to: "/tematicas",
    });

    // Bases solo visible para usuarios autenticados
    items.push({
      label: "Bases",
      icon: "heroicons:document-text",
      to: "/bases",
    });

    // FAQ solo visible para usuarios autenticados
    items.push({
      label: "FAQ",
      icon: "heroicons:question-mark-circle",
      to: "/faq",
    });
  }

  return items;
});

const getUserInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Manejar clic en cerrar sesión
const handleLogout = async () => {
  console.log("[Header] Iniciando cierre de sesión...");

  try {
    isMenuOpen.value = false; // Cerrar menú inmediatamente

    // Usar el plugin de logout dedicado (nombre correcto)
    if (typeof $logoutUser === "function") {
      console.log("[Header] Usando plugin de logout dedicado");
      const result = await $logoutUser();
      console.log(
        "[Header] Resultado del cierre de sesión con plugin:",
        result
      );

      if (!result.success) {
        throw new Error(result.error || "Error durante el proceso de logout");
      }
    } else {
      // Fallback a la función normal
      console.log("[Header] Fallback: usando función logout del composable");
      const result = await logout();

      if (!result.success) {
        throw new Error(result.error || "Error durante el proceso de logout");
      }
    }

    // Notificación de éxito
    console.log("[Header] Sesión cerrada correctamente");

    // Redirección
    router.push("/");
    console.log("[Header] Redirigido a la página principal");

    // Recargar la página para limpiar completamente los estados
    setTimeout(() => {
      console.log("[Header] Recargando página...");
      window.location.reload();
    }, 300);
  } catch (error) {
    console.error("[Header] Error al cerrar sesión:", error);
    // Intentar una limpieza forzada si falla todo lo demás
    user.value = null;
    router.push("/");
  }
};

// Elementos del menú de usuario
const userMenuItems = computed(() => {
  return [
    [
      {
        label: "Mi Perfil",
        icon: "heroicons:user",
        to: "/perfil",
      },
      {
        label: "Mi Juego",
        icon: "heroicons:play",
        to: "/mis-juegos",
      },
      ...(user.value?.email?.endsWith("@santotomas.cl")
        ? [
            {
              label: "Administración",
              icon: "heroicons:cog-6-tooth",
              to: "/admin",
            },
          ]
        : []),
    ],
    [
      {
        label: "Cerrar Sesión",
        icon: "heroicons:arrow-right-on-rectangle",
        onSelect: () => handleLogout(),
      },
    ],
  ];
});
</script>
