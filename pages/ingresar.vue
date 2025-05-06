<template>
  <div class="container mx-auto px-4 py-12">
    <div
      class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <h1 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <UFormGroup label="Correo Electrónico" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="usuario@alumnos.santotomas.cl"
            autocomplete="email"
            :ui="{ icon: { trailing: { name: 'i-heroicons-envelope' } } }"
          />
          <template #hint>
            <span v-if="emailError" class="text-red-500">{{ emailError }}</span>
          </template>
        </UFormGroup>

        <UFormGroup label="Contraseña" name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••••"
            autocomplete="current-password"
            :ui="{ icon: { trailing: { name: 'i-heroicons-lock-closed' } } }"
          />
          <template #hint>
            <span v-if="passwordError" class="text-red-500">{{
              passwordError
            }}</span>
          </template>
        </UFormGroup>

        <div class="flex items-center justify-between">
          <UCheckbox v-model="rememberMe" name="remember">
            Recordarme
          </UCheckbox>

          <NuxtLink
            to="/recuperar-password"
            class="text-sm text-primary hover:underline"
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
            class="text-primary hover:underline font-medium"
          >
            Regístrate
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Iniciar Sesión",
  description: "Inicia sesión en la plataforma de competencia de minijuegos",
});

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const emailError = ref("");
const passwordError = ref("");

const handleLogin = async () => {
  // Resetear errores
  emailError.value = "";
  passwordError.value = "";

  // Validación básica
  if (!email.value) {
    emailError.value = "El correo electrónico es obligatorio";
    return;
  }

  // Permitir ambos dominios institucionales
  const emailRegex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
  if (!emailRegex.test(email.value)) {
    emailError.value =
      "Debes utilizar tu correo institucional (@alumnos.santotomas.cl o @santotomas.cl)";
    return;
  }

  if (!password.value) {
    passwordError.value = "La contraseña es obligatoria";
    return;
  }

  // Simulación de inicio de sesión (se reemplazará por Firebase)
  try {
    isLoading.value = true;

    // Aquí iría la integración con Firebase Auth
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirigir al usuario (esto será manejado cuando se implemente Firebase)
    navigateTo("/");
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión. Por favor, intenta nuevamente.");
  } finally {
    isLoading.value = false;
  }
};
</script>
