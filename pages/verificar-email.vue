<template>
  <div class="container mx-auto px-4 py-12">
    <div
      class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <div class="text-center mb-8">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-envelope-open"
            class="text-primary w-10 h-10"
          />
        </div>

        <h1 class="text-2xl font-bold mb-4">Verificación de Email</h1>

        <div v-if="isAuthenticated">
          <div v-if="!isEmailVerified">
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Hemos enviado un correo de verificación a
              <strong>{{ user?.email }}</strong
              >. Por favor, revisa tu bandeja de entrada y haz clic en el enlace
              para verificar tu cuenta.
            </p>

            <div class="space-y-4">
              <UButton
                @click="resendVerificationEmail"
                color="primary"
                block
                :loading="isLoading"
              >
                Reenviar correo de verificación
              </UButton>

              <UButton @click="refreshState" variant="soft" color="gray" block>
                Ya verifiqué mi correo
              </UButton>
            </div>

            <div
              v-if="message"
              :class="[
                'mt-4 p-3 rounded-md text-sm',
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
              ]"
            >
              {{ message.text }}
            </div>
          </div>

          <div
            v-else
            class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6"
          >
            <UIcon
              name="i-heroicons-check-circle"
              class="h-12 w-12 text-green-500 mx-auto mb-3"
            />
            <h2
              class="text-lg font-medium text-green-800 dark:text-green-200 mb-2"
            >
              ¡Email Verificado!
            </h2>
            <p class="text-green-700 dark:text-green-300 mb-4">
              Tu dirección de correo electrónico ha sido verificada
              correctamente.
            </p>
            <UButton to="/" color="primary" block>
              Continuar a la página principal
            </UButton>
          </div>
        </div>

        <div v-else>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Debes iniciar sesión para verificar tu correo electrónico.
          </p>
          <UButton to="/ingresar" color="primary" block>
            Iniciar Sesión
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Verificación de Email",
  description: "Verifica tu dirección de correo electrónico para GameCraft2025",
});

const {
  user,
  isAuthenticated,
  isEmailVerified,
  sendVerificationEmail,
  refreshUserState,
} = useAuth();

const isLoading = ref(false);
const message = ref(null);

// Comprobar el estado actual al cargar la página
onMounted(async () => {
  if (isAuthenticated.value) {
    await refreshUserState();
  }
});

const resendVerificationEmail = async () => {
  isLoading.value = true;
  message.value = null;

  try {
    const result = await sendVerificationEmail();

    if (result.success) {
      message.value = {
        type: "success",
        text: "Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.",
      };
    } else {
      message.value = {
        type: "error",
        text:
          result.error ||
          "No se pudo enviar el correo. Inténtalo de nuevo más tarde.",
      };
    }
  } catch (error) {
    console.error("Error al reenviar correo:", error);
    message.value = {
      type: "error",
      text: "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.",
    };
  } finally {
    isLoading.value = false;
  }
};

const refreshState = async () => {
  isLoading.value = true;
  message.value = null;

  try {
    await refreshUserState();

    if (!isEmailVerified.value) {
      message.value = {
        type: "error",
        text: "Tu correo aún no ha sido verificado. Por favor, revisa tu bandeja de entrada o solicita un nuevo correo de verificación.",
      };
    }
  } catch (error) {
    console.error("Error al refrescar estado:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
