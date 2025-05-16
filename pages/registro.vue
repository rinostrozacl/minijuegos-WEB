<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Mensaje de registro deshabilitado -->
    <div
      v-if="!isRegistrationEnabled"
      class="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-center"
    >
      <div class="mb-6">
        <UIcon
          name="i-heroicons-x-circle"
          class="w-16 h-16 mx-auto text-red-500"
        />
      </div>
      <h1 class="text-2xl font-bold mb-4">Registro no disponible</h1>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        El administrador ha deshabilitado temporalmente el registro de usuarios.
      </p>
      <UButton to="/" color="primary"> Volver a la página principal </UButton>
    </div>

    <!-- Formulario de registro (solo visible si el registro está habilitado) -->
    <div
      v-else
      class="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8"
    >
      <h1 class="text-2xl font-bold text-center mb-8">Registro de Usuario</h1>

      <UStepper
        v-model="currentStepIndex"
        :items="steps"
        class="mb-8"
        color="primary"
        :disabled-items="disabledSteps"
        :ui="{ item: { interactive: false } }"
      />

      <!-- Paso 1: Información personal -->
      <div v-if="currentStepIndex === 0">
        <form @submit.prevent="handleSubmitStepOne" class="flex flex-col gap-6">
          <!-- Campo de nombre -->
          <div class="space-y-2">
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre completo <span class="text-red-500">*</span>
            </label>
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <UIcon name="i-heroicons-user" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                v-model="userData.name"
                type="text"
                placeholder="Juan Pérez"
                autocomplete="name"
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p v-if="errors.name" class="text-sm text-red-500">
              {{ errors.name }}
            </p>
            <p v-else class="text-gray-500 text-sm mt-1">
              Ingresa tu nombre completo
            </p>
          </div>

          <!-- Campo de correo electrónico -->
          <div class="space-y-2">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Correo Electrónico <span class="text-red-500">*</span>
            </label>
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <UIcon
                  name="i-heroicons-envelope"
                  class="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                id="email"
                v-model="userData.email"
                type="email"
                placeholder="usuario@alumnos.santotomas.cl"
                autocomplete="email"
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p v-if="errors.email" class="text-sm text-red-500">
              {{ errors.email }}
            </p>
            <p v-else class="text-gray-500 text-sm mt-1">
              Debe ser un correo institucional (@alumnos.santotomas.cl o
              @santotomas.cl)
            </p>
          </div>

          <!-- Campo de contraseña -->
          <div class="space-y-2">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <UIcon
                  name="i-heroicons-lock-closed"
                  class="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                id="password"
                v-model="userData.password"
                type="password"
                placeholder="••••••••••"
                autocomplete="new-password"
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p v-if="errors.password" class="text-sm text-red-500">
              {{ errors.password }}
            </p>
            <p v-else class="text-gray-500 text-sm mt-1">
              Mínimo 8 caracteres, incluye números y letras
            </p>
          </div>

          <!-- Campo de confirmación de contraseña -->
          <div class="space-y-2">
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmar contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <UIcon
                  name="i-heroicons-lock-closed"
                  class="h-5 w-5 text-gray-400"
                />
              </div>
              <input
                id="confirmPassword"
                v-model="userData.confirmPassword"
                type="password"
                placeholder="••••••••••"
                autocomplete="new-password"
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p v-if="errors.confirmPassword" class="text-sm text-red-500">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Botones de acción -->
          <div
            class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <UButton
              variant="link"
              to="/ingresar"
              size="sm"
              class="text-primary-600"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </UButton>
            <UButton
              type="submit"
              color="primary"
              size="md"
              :loading="isLoading"
            >
              Continuar
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" />
              </template>
            </UButton>
          </div>
        </form>
      </div>

      <!-- Paso 2: Verificación de correo -->
      <div v-else-if="currentStepIndex === 1">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center"
          >
            <UIcon name="i-heroicons-envelope" class="text-primary w-8 h-8" />
          </div>
          <h2 class="text-xl font-semibold mb-2">Verificación de Correo</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Hemos enviado un código de verificación a:
          </p>
          <p class="font-medium text-gray-800 dark:text-gray-200 mb-4">
            {{ userData.email }}
          </p>
        </div>

        <form @submit.prevent="handleSubmitStepTwo" class="space-y-6">
          <div class="max-w-xs mx-auto space-y-2">
            <label
              for="code"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Código de verificación <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="verificationState.code"
              type="text"
              placeholder="123456"
              maxlength="6"
              class="w-full px-4 py-2 text-center font-mono text-xl border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <p v-if="errors.code" class="text-sm text-red-500 text-center">
              {{ errors.code }}
            </p>
          </div>

          <div class="text-center mt-4">
            <UButton
              type="button"
              variant="link"
              @click="resendCode"
              :disabled="resendCountdown > 0"
              size="sm"
            >
              {{
                resendCountdown > 0
                  ? `Reenviar código (${resendCountdown}s)`
                  : "Reenviar código"
              }}
            </UButton>
          </div>

          <div class="flex justify-between items-center mt-8">
            <UButton type="button" variant="outline" @click="goBack" size="md">
              <template #leading>
                <UIcon name="i-heroicons-arrow-left" />
              </template>
              Volver
            </UButton>

            <UButton
              type="submit"
              color="primary"
              :loading="isLoading"
              size="md"
            >
              Verificar
            </UButton>
          </div>
        </form>
      </div>

      <!-- Paso 3: Registro completado -->
      <div v-else class="text-center py-6">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-check-circle"
            class="text-green-500 w-16 h-16"
          />
        </div>
        <h2 class="text-2xl font-semibold mb-3">¡Registro Exitoso!</h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-8">
          Tu cuenta ha sido creada correctamente. Ya puedes acceder a la
          plataforma.
        </p>

        <UButton to="/ingresar" color="primary" size="lg">
          Iniciar Sesión
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right" />
          </template>
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { z } from "zod";

definePageMeta({
  title: "Registro",
  description:
    "Regístrate en GameCraft2025, la competencia universitaria de desarrollo de videojuegos",
});

// Cargar configuración del sistema
const { config, isLoading: isConfigLoading } = useSystemConfig();

// Variable para determinar si el registro está habilitado
const isRegistrationEnabled = computed(() => {
  return config.value?.isRegistrationEnabled ?? false;
});

// Si el registro está deshabilitado, redirigir a la página principal después de 5 segundos
onMounted(() => {
  if (!isRegistrationEnabled.value) {
    setTimeout(() => {
      navigateTo("/");
    }, 5000);
  }
});

const toast = useToast();
const steps = ref([
  {
    title: "Información",
    description: "Datos personales",
    icon: "i-heroicons-user-circle",
  },
  {
    title: "Verificación",
    description: "Correo electrónico",
    icon: "i-heroicons-envelope",
  },
  {
    title: "Completado",
    description: "Registro exitoso",
    icon: "i-heroicons-check-circle",
  },
]);

const currentStepIndex = ref(0);
const isLoading = ref(false);
const resendCountdown = ref(0);
const { sendVerificationEmail, requestVerificationCode, verifyCode } =
  useEmail();
const { register } = useAuth();
const { validateEmail } = useValidation();

// Controlar los pasos deshabilitados
const disabledSteps = computed(() => {
  const disabled = [];
  if (currentStepIndex.value < 1) disabled.push(1, 2);
  if (currentStepIndex.value < 2) disabled.push(2);
  return disabled;
});

// Estado para el formulario
const userData = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// Estado para la verificación
const verificationState = reactive({
  code: "",
});

// Estado para los errores
const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  code: "",
});

//----------------------------------------
// FUNCIONES DE VALIDACIÓN Y MANEJO DE FORMULARIO
//----------------------------------------

// Función para validar el primer paso
const validateStepOne = async () => {
  // Verificar si el registro está habilitado
  if (!isRegistrationEnabled.value) {
    toast.add({
      title: "Registro deshabilitado",
      description: "El administrador ha deshabilitado el registro de usuarios.",
      color: "red",
    });
    return false;
  }

  let isValid = true;
  errors.name = "";
  errors.email = "";
  errors.password = "";
  errors.confirmPassword = "";

  console.log("Validando primer paso..."); // Log para depuración

  // Validar nombre
  if (!userData.name || userData.name.trim().length < 3) {
    errors.name = "El nombre debe tener al menos 3 caracteres";
    isValid = false;
    console.log("Error en nombre"); // Log para depuración
  }

  // Validar email
  const emailRegex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
  if (!userData.email) {
    errors.email = "El correo electrónico es obligatorio";
    isValid = false;
    console.log("Error: email vacío"); // Log para depuración
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = "Formato de correo electrónico inválido";
    isValid = false;
    console.log("Error: formato de email inválido"); // Log para depuración
  } else if (!emailRegex.test(userData.email)) {
    errors.email =
      "Debe ser un correo institucional (@alumnos.santotomas.cl o @santotomas.cl)";
    isValid = false;
    console.log("Error: dominio de email no permitido"); // Log para depuración
  } else {
    // Validar contra la lista de correos permitidos
    const emailValidation = await validateEmail(userData.email);
    if (!emailValidation.success) {
      errors.email = emailValidation.message;
      isValid = false;
      console.log("Error: email no autorizado"); // Log para depuración
    }
  }

  // Validar contraseña
  if (!userData.password) {
    errors.password = "La contraseña es obligatoria";
    isValid = false;
    console.log("Error: contraseña vacía"); // Log para depuración
  } else if (userData.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres";
    isValid = false;
    console.log("Error: contraseña demasiado corta"); // Log para depuración
  } else if (!/[a-zA-Z]/.test(userData.password)) {
    errors.password = "La contraseña debe incluir al menos una letra";
    isValid = false;
    console.log("Error: contraseña sin letras"); // Log para depuración
  } else if (!/\d/.test(userData.password)) {
    errors.password = "La contraseña debe incluir al menos un número";
    isValid = false;
    console.log("Error: contraseña sin números"); // Log para depuración
  }

  // Validar confirmación de contraseña
  if (!userData.confirmPassword) {
    errors.confirmPassword = "Debes confirmar la contraseña";
    isValid = false;
    console.log("Error: confirmación de contraseña vacía"); // Log para depuración
  } else if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
    isValid = false;
    console.log("Error: las contraseñas no coinciden"); // Log para depuración
  }

  console.log("Resultado de la validación:", isValid ? "Válido" : "Inválido"); // Log para depuración
  return isValid;
};

// Manejar envío del primer paso
const handleSubmitStepOne = async () => {
  console.log("Formulario enviado - Paso 1"); // Log para depuración

  // Verificar nuevamente si el registro está habilitado
  if (!isRegistrationEnabled.value) {
    toast.add({
      title: "Registro deshabilitado",
      description: "El administrador ha deshabilitado el registro de usuarios.",
      color: "red",
    });
    return;
  }

  console.log("Datos:", userData); // Log de los datos del formulario

  // Validar formulario
  if (!(await validateStepOne())) {
    console.log("Validación fallida - No se continúa"); // Log para depuración
    return;
  }

  try {
    console.log("Iniciando envío de código de verificación..."); // Log para depuración
    isLoading.value = true;

    // Solicitar código de verificación al servidor
    const result = await requestVerificationCode(userData.email);

    if (!result.success) {
      console.log("Error al solicitar código:", result.error); // Log para depuración
      toast.add({
        title: "Error al enviar código",
        description: "No pudimos enviar el código. Inténtalo de nuevo.",
        color: "red",
      });
      return;
    }

    // Avanzar al siguiente paso
    console.log("Avanzando al siguiente paso..."); // Log para depuración
    startResendCountdown();
    currentStepIndex.value = 1;
  } catch (error) {
    console.error("Error al procesar primer paso:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error procesando tus datos. Inténtalo de nuevo.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// Manejar envío del segundo paso
const handleSubmitStepTwo = async () => {
  // Verificar nuevamente si el registro está habilitado
  if (!isRegistrationEnabled.value) {
    toast.add({
      title: "Registro deshabilitado",
      description: "El administrador ha deshabilitado el registro de usuarios.",
      color: "red",
    });
    return;
  }

  try {
    isLoading.value = true;
    errors.code = ""; // Limpiar error previo

    // Comprobar que el código se ha ingresado
    if (!verificationState.code) {
      errors.code = "El código de verificación es obligatorio";
      isLoading.value = false;
      return;
    }

    // Verificar el código con el servidor
    const verificationResult = await verifyCode(
      userData.email,
      verificationState.code
    );

    if (!verificationResult.success) {
      errors.code =
        verificationResult.message ||
        "Código incorrecto. Verifica y vuelve a intentar.";
      isLoading.value = false;
      return;
    }

    // Registrar usuario en Firebase
    const result = await register(
      userData.email,
      userData.password,
      userData.name
    );

    if (!result.success) {
      toast.add({
        title: "Error al crear la cuenta",
        description: result.error || "Ha ocurrido un error inesperado",
        color: "red",
      });
      return;
    }

    // Verificar si necesita inicio de sesión manual
    if (result.requireManualLogin) {
      // Mostrar mensaje de éxito pero indicando que debe iniciar sesión manualmente
      toast.add({
        title: "Cuenta creada exitosamente",
        description:
          result.message ||
          "Tu cuenta ha sido creada correctamente. Por favor, inicia sesión.",
        color: "success",
        timeout: 8000, // Dar más tiempo para leer
      });

      // Esperar un momento y luego redirigir a inicio de sesión
      setTimeout(() => {
        navigateTo("/ingresar");
      }, 2000);

      return;
    }

    // Si todo salió bien, avanzar al paso final
    currentStepIndex.value = 2;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    toast.add({
      title: "Error al crear la cuenta",
      description: "Ha ocurrido un error inesperado",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// Volver al paso anterior
const goBack = () => {
  currentStepIndex.value = 0;
  verificationState.code = "";
  errors.code = "";
};

// Función para iniciar cuenta regresiva de reenvío
const startResendCountdown = () => {
  resendCountdown.value = 60; // 60 segundos
  const interval = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

// Función para reenviar código
const resendCode = async () => {
  if (resendCountdown.value > 0) return;

  try {
    isLoading.value = true;

    // Solicitar un nuevo código al servidor
    const result = await requestVerificationCode(userData.email);

    if (!result.success) {
      toast.add({
        title: "Error al enviar código",
        description: "No pudimos enviar el código. Inténtalo de nuevo.",
        color: "red",
      });
      return;
    }

    // Iniciar cuenta regresiva
    startResendCountdown();
    toast.add({
      title: "Código enviado",
      description: "Se ha enviado un nuevo código a tu correo.",
      color: "success",
    });
  } catch (error) {
    console.error("Error al reenviar código:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
