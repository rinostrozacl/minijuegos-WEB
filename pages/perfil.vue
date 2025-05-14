<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Mi Perfil</h1>

    <!-- Pantalla de carga -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <!-- Si el usuario no está autenticado -->
    <div v-else-if="!isLoggedIn" class="text-center py-16">
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Acceso restringido</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Debes iniciar sesión para acceder a tu perfil de usuario.
      </p>
      <UButton to="/ingresar" color="primary" size="lg">
        Iniciar sesión
      </UButton>
    </div>

    <!-- Si el usuario está autenticado -->
    <div v-else class="max-w-2xl mx-auto">
      <UCard class="mb-8">
        <div
          class="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4"
        >
          <!-- Avatar y botón para cambiar foto -->
          <div class="flex flex-col items-center gap-2">
            <UAvatar
              :src="user?.photoURL || ''"
              :alt="user?.displayName || 'Usuario'"
              :text="userInitials"
              size="xl"
            />
            <UButton variant="ghost" size="sm" disabled>
              <template #leading>
                <UIcon name="i-heroicons-camera" />
              </template>
              Cambiar foto
            </UButton>
          </div>

          <!-- Información del usuario -->
          <div class="flex-grow space-y-4">
            <div>
              <h2 class="text-xl font-semibold">
                {{ user?.displayName || "Usuario" }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">{{ user?.email }}</p>
            </div>

            <!-- Estado de verificación de email -->
            <div
              v-if="!isEmailVerified"
              class="bg-amber-50 dark:bg-amber-900/20 p-3 rounded flex items-start gap-3"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-amber-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p class="font-medium text-amber-800 dark:text-amber-200">
                  Email no verificado
                </p>
                <p class="text-sm text-amber-700 dark:text-amber-300">
                  Para acceder a todas las funciones, verifica tu email.
                </p>
                <UButton
                  class="mt-2"
                  color="amber"
                  variant="soft"
                  size="sm"
                  @click="handleRequestVerification"
                >
                  Verificar email
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Formulario para editar información básica -->
      <UCard>
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold">Información personal</h3>
          </div>
        </template>

        <div class="p-4">
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Campo Nombre -->
            <div class="space-y-2">
              <label
                for="displayName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nombre
              </label>
              <UInput
                id="displayName"
                v-model="formState.displayName"
                placeholder="Tu nombre completo"
              />
            </div>

            <!-- Campo Email -->
            <div class="space-y-2">
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <UInput
                id="email"
                v-model="formState.email"
                placeholder="tu@email.com"
                disabled
              />
              <div class="flex items-center mt-1 text-xs">
                <template v-if="isEmailVerified">
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="text-green-500 mr-1"
                  />
                  <span class="text-green-600">Email verificado</span>
                </template>
                <template v-else>
                  <UIcon
                    name="i-heroicons-exclamation-circle"
                    class="text-amber-500 mr-1"
                  />
                  <span class="text-amber-600 mr-2">Email no verificado</span>
                  <UButton
                    size="xs"
                    color="amber"
                    @click="handleRequestVerification"
                  >
                    Verificar email
                  </UButton>
                </template>
              </div>
            </div>

            <!-- Botón Submit -->
            <div class="flex justify-end">
              <UButton type="submit" color="primary" :loading="isSubmitting">
                Guardar cambios
              </UButton>
            </div>
          </form>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from "vue";

// SEO
definePageMeta({
  title: "Mi Perfil",
  description: "Gestiona tu información personal y preferencias",
});

// Estado
const isLoading = ref(true);
const isSubmitting = ref(false);
const {
  user,
  isAuthenticated: isLoggedIn,
  isEmailVerified,
  updateUserProfile,
  sendVerificationEmail,
} = useAuth();
const toast = useToast();

// Estado del formulario
const formState = reactive({
  displayName: "",
  email: "",
});

// Inicializar formulario con datos del usuario
const initFormWithUserData = () => {
  formState.displayName = user.value?.displayName || "";
  formState.email = user.value?.email || "";
};

// Obtener iniciales para el avatar
const userInitials = computed(() => {
  if (!user.value?.displayName) return "U";

  const nameParts = user.value.displayName.split(" ");
  if (nameParts.length === 0) return "U";
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

  return (
    nameParts[0].charAt(0).toUpperCase() +
    nameParts[nameParts.length - 1].charAt(0).toUpperCase()
  );
});

// Manejar envío del formulario
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // Solo actualizar si hay cambios
    if (formState.displayName !== user.value?.displayName) {
      const result = await updateUserProfile({
        displayName: formState.displayName,
      });

      if (result.success) {
        toast.add({
          title: "Perfil actualizado",
          description: "Tus cambios han sido guardados correctamente",
          color: "green",
        });
      } else {
        throw new Error(result.error || "Error al actualizar perfil");
      }
    } else {
      toast.add({
        title: "Sin cambios",
        description: "No se detectaron cambios en tu perfil",
        color: "blue",
      });
    }
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    toast.add({
      title: "Error",
      description: "No se pudieron guardar los cambios",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Solicitar verificación de correo
const handleRequestVerification = async () => {
  try {
    const result = await sendVerificationEmail();
    if (result.success) {
      toast.add({
        title: "Correo enviado",
        description:
          "Se ha enviado un correo de verificación a tu dirección de email",
        color: "green",
      });
    } else {
      throw new Error(result.error || "Error al enviar correo");
    }
  } catch (error) {
    console.error("Error al solicitar verificación:", error);
    toast.add({
      title: "Error",
      description:
        "No se pudo enviar el correo de verificación. Intenta más tarde.",
      color: "red",
    });
  }
};

// Al montar el componente
onMounted(async () => {
  try {
    // Esperar a que la autenticación esté lista
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isLoggedIn.value) {
      initFormWithUserData();
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  } finally {
    isLoading.value = false;
  }
});

// Observar cambios en el usuario
watch(
  () => user.value,
  () => {
    if (user.value) {
      initFormWithUserData();
    }
  },
  { deep: true }
);
</script>
