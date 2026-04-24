<template>
  <div class="container mx-auto px-4 py-12">
    <div
      class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <h1 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Correo Electrónico -->
        <div class="space-y-2">
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Correo Electrónico
          </label>
          <div class="relative mt-1">
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="usuario@alumnos.santotomas.cl"
              autocomplete="email"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <UIcon
                name="i-heroicons-envelope"
                class="h-5 w-5 text-gray-400"
              />
            </div>
          </div>
          <p v-if="emailError" class="text-sm text-red-500">{{ emailError }}</p>
        </div>

        <!-- Contraseña -->
        <div class="space-y-2">
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Contraseña
          </label>
          <div class="relative mt-1">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••••"
              autocomplete="current-password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <UIcon
                name="i-heroicons-lock-closed"
                class="h-5 w-5 text-gray-400"
              />
            </div>
          </div>
          <p v-if="passwordError" class="text-sm text-red-500">
            {{ passwordError }}
          </p>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
            />
            <label
              for="remember-me"
              class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Recordarme
            </label>
          </div>

          <NuxtLink
            to="/recuperar-password"
            class="text-sm text-primary-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </NuxtLink>
        </div>

        <UButton type="submit" color="primary" block :loading="isLoading">
          Iniciar Sesión
        </UButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?
          <NuxtLink
            to="/registro"
            class="text-primary-600 hover:underline font-medium"
          >
            Regístrate
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isRegistrationEmailFormatAllowed } from "~/utils/registration-email";

definePageMeta({
  title: "Iniciar Sesión",
  description:
    "Inicia sesión en GameCraft2026, la competencia universitaria de desarrollo de videojuegos",
});

const route = useRoute();
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const emailError = ref("");
const passwordError = ref("");
const { login, isAuthenticated, waitForAuthInitialized } = useAuth();

const safeRedirectTarget = () => {
  const q = route.query.redirect;
  if (
    typeof q === "string" &&
    q.startsWith("/") &&
    !q.startsWith("//") &&
    !q.includes("://")
  ) {
    return q;
  }
  return "/";
};

onMounted(async () => {
  await waitForAuthInitialized();
  if (isAuthenticated.value) {
    await navigateTo(safeRedirectTarget());
  }
});

const handleLogin = async () => {
  // Resetear errores
  emailError.value = "";
  passwordError.value = "";

  // Validación básica
  if (!email.value) {
    emailError.value = "El correo electrónico es obligatorio";
    return;
  }

  if (!isRegistrationEmailFormatAllowed(email.value)) {
    emailError.value =
      "Debes utilizar correo institucional o un correo autorizado para pruebas";
    return;
  }

  if (!password.value) {
    passwordError.value = "La contraseña es obligatoria";
    return;
  }

  // Iniciar sesión con Firebase
  try {
    isLoading.value = true;
    const result = await login(email.value, password.value);

    if (result.success) {
      console.log("Usuario autenticado:", result.user);
      await navigateTo(safeRedirectTarget());
    } else {
      // Manejar error de autenticación
      passwordError.value =
        "Credenciales incorrectas. Revisa tu email y contraseña.";
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    passwordError.value = "Error al iniciar sesión. Inténtalo de nuevo.";
  } finally {
    isLoading.value = false;
  }
};
</script>
