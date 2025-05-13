<template>
  <div class="container mx-auto px-4 py-12">
    <div
      class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <h1 class="text-2xl font-bold text-center mb-6">Recuperar Contraseña</h1>

      <div v-if="!emailSent">
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña
        </p>

        <form @submit.prevent="handlePasswordReset" class="space-y-6">
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
            <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
          </div>

          <UButton type="submit" color="primary" block :loading="isLoading">
            Enviar Enlace de Recuperación
          </UButton>
        </form>
      </div>

      <div v-else class="text-center py-4">
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
          <UIcon
            name="i-heroicons-check-circle"
            class="h-12 w-12 text-green-500 mx-auto mb-3"
          />
          <h2
            class="text-lg font-medium text-green-800 dark:text-green-200 mb-2"
          >
            Correo Enviado
          </h2>
          <p class="text-green-700 dark:text-green-300">
            Hemos enviado un enlace de recuperación a {{ email }}. Por favor,
            revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <UButton to="/ingresar" block> Volver a Iniciar Sesión </UButton>
          <UButton @click="resetForm" variant="ghost" color="gray">
            Intentar con otro correo
          </UButton>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          ¿Recordaste tu contraseña?
          <NuxtLink
            to="/ingresar"
            class="text-primary-600 hover:underline font-medium"
          >
            Iniciar Sesión
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Recuperar Contraseña",
  description: "Recupera tu contraseña para acceder a GameCraft2025",
});

import { ref } from "vue";
import { sendPasswordResetEmail } from "firebase/auth";

const { $auth } = useNuxtApp();
const email = ref("");
const error = ref("");
const isLoading = ref(false);
const emailSent = ref(false);

const handlePasswordReset = async () => {
  // Resetear error
  error.value = "";

  // Validación básica
  if (!email.value) {
    error.value = "El correo electrónico es obligatorio";
    return;
  }

  // Permitir ambos dominios institucionales
  const emailRegex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
  if (!emailRegex.test(email.value)) {
    error.value =
      "Debes utilizar tu correo institucional (@alumnos.santotomas.cl o @santotomas.cl)";
    return;
  }

  try {
    isLoading.value = true;

    // Enviar correo de recuperación
    await sendPasswordResetEmail($auth, email.value);

    // Mostrar mensaje de éxito
    emailSent.value = true;
  } catch (err) {
    console.error("Error al enviar correo de recuperación:", err);

    if (err.code === "auth/user-not-found") {
      error.value = "No existe una cuenta asociada a este correo electrónico";
    } else {
      error.value =
        "Ocurrió un error al enviar el correo. Inténtalo de nuevo más tarde.";
    }
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  email.value = "";
  error.value = "";
  emailSent.value = false;
};
</script>
