<template>
  <div class="container mx-auto px-4 py-12">
    <div
      class="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
    >
      <h1 class="text-2xl font-bold text-center mb-6">Registro de Usuario</h1>

      <Stepper v-model="currentStep" :steps="steps" class="mb-8" />

      <!-- Paso 1: Información personal -->
      <div v-if="currentStep === 1">
        <form @submit.prevent="goToStep(2)" class="space-y-6">
          <UFormGroup label="Nombre completo" name="name">
            <UInput
              v-model="userData.name"
              placeholder="Juan Pérez"
              autocomplete="name"
              :ui="{ icon: { trailing: { name: 'i-heroicons-user' } } }"
            />
            <template #hint>
              <span v-if="errors.name" class="text-red-500">{{
                errors.name
              }}</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Correo Electrónico" name="email" required>
            <UInput
              v-model="userData.email"
              type="email"
              placeholder="usuario@alumnos.santotomas.cl"
              autocomplete="email"
              :ui="{ icon: { trailing: { name: 'i-heroicons-envelope' } } }"
            />
            <template #hint>
              <span v-if="errors.email" class="text-red-500">{{
                errors.email
              }}</span>
              <span v-else class="text-gray-500">
                Debe ser un correo institucional (@alumnos.santotomas.cl o
                @santotomas.cl)
              </span>
            </template>
          </UFormGroup>

          <UFormGroup label="Contraseña" name="password" required>
            <UInput
              v-model="userData.password"
              type="password"
              placeholder="••••••••••"
              autocomplete="new-password"
              :ui="{ icon: { trailing: { name: 'i-heroicons-lock-closed' } } }"
            />
            <template #hint>
              <span v-if="errors.password" class="text-red-500">{{
                errors.password
              }}</span>
              <span v-else class="text-gray-500"
                >Mínimo 8 caracteres, incluye números y letras</span
              >
            </template>
          </UFormGroup>

          <UFormGroup
            label="Confirmar contraseña"
            name="confirmPassword"
            required
          >
            <UInput
              v-model="userData.confirmPassword"
              type="password"
              placeholder="••••••••••"
              autocomplete="new-password"
              :ui="{ icon: { trailing: { name: 'i-heroicons-lock-closed' } } }"
            />
            <template #hint>
              <span v-if="errors.confirmPassword" class="text-red-500">{{
                errors.confirmPassword
              }}</span>
            </template>
          </UFormGroup>

          <div class="flex justify-end mt-8">
            <UButton type="submit" color="primary">
              Continuar
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" />
              </template>
            </UButton>
          </div>
        </form>
      </div>

      <!-- Paso 2: Verificación de correo -->
      <div v-else-if="currentStep === 2">
        <div class="text-center mb-6">
          <UIcon
            name="i-heroicons-envelope"
            class="text-primary mx-auto w-16 h-16 mb-4"
          />
          <h2 class="text-xl font-semibold mb-2">Verificación de Correo</h2>
          <p class="text-gray-600 dark:text-gray-400">
            Hemos enviado un código de verificación a:<br />
            <span class="font-medium">{{ userData.email }}</span>
          </p>
        </div>

        <form @submit.prevent="verifyCode" class="space-y-6">
          <UFormGroup label="Código de verificación" name="verificationCode">
            <UInput
              v-model="verificationCode"
              placeholder="123456"
              class="text-center font-mono text-xl"
              maxlength="6"
            />
            <template #hint>
              <span v-if="errors.verificationCode" class="text-red-500">{{
                errors.verificationCode
              }}</span>
            </template>
          </UFormGroup>

          <div class="text-center">
            <UButton
              type="button"
              variant="link"
              @click="resendCode"
              :disabled="resendCountdown > 0"
            >
              {{
                resendCountdown > 0
                  ? `Reenviar código (${resendCountdown}s)`
                  : "Reenviar código"
              }}
            </UButton>
          </div>

          <div class="flex justify-between mt-8">
            <UButton type="button" variant="outline" @click="currentStep = 1">
              <template #leading>
                <UIcon name="i-heroicons-arrow-left" />
              </template>
              Volver
            </UButton>

            <UButton type="submit" color="primary" :loading="isLoading">
              Verificar
            </UButton>
          </div>
        </form>
      </div>

      <!-- Paso 3: Registro completado -->
      <div v-else class="text-center">
        <UIcon
          name="i-heroicons-check-circle"
          class="text-green-500 mx-auto w-24 h-24 mb-4"
        />
        <h2 class="text-2xl font-semibold mb-2">¡Registro Exitoso!</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Tu cuenta ha sido creada correctamente. Ya puedes acceder a la
          plataforma.
        </p>

        <UButton to="/ingresar" color="primary" size="lg">
          Iniciar Sesión
        </UButton>
      </div>

      <div class="mt-6 text-center" v-if="currentStep < 3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?
          <NuxtLink
            to="/ingresar"
            class="text-primary hover:underline font-medium"
          >
            Inicia sesión
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Registro",
  description: "Regístrate en la plataforma de competencia de minijuegos",
});

const steps = [
  { title: "Información", description: "Datos personales" },
  { title: "Verificación", description: "Correo electrónico" },
  { title: "Completado", description: "Registro exitoso" },
];

const currentStep = ref(1);
const isLoading = ref(false);
const resendCountdown = ref(0);
const verificationCode = ref("");
const { sendVerificationEmail } = useEmail();
const actualVerificationCode = ref("");

const userData = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  verificationCode: "",
});

// Función para validar el correo electrónico
const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@(alumnos\.|)santotomas\.cl$/;
  return regex.test(email);
};

// Función para validar la contraseña
const validatePassword = (password) => {
  return (
    password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
  );
};

// Función para validar el formulario del paso 1
const validateStep1 = () => {
  let valid = true;

  // Validar nombre
  if (!userData.name.trim()) {
    errors.name = "El nombre es obligatorio";
    valid = false;
  } else {
    errors.name = "";
  }

  // Validar correo
  if (!userData.email) {
    errors.email = "El correo electrónico es obligatorio";
    valid = false;
  } else if (!validateEmail(userData.email)) {
    errors.email =
      "Debe ser un correo institucional válido (@alumnos.santotomas.cl o @santotomas.cl)";
    valid = false;
  } else {
    errors.email = "";
  }

  // Validar contraseña
  if (!userData.password) {
    errors.password = "La contraseña es obligatoria";
    valid = false;
  } else if (!validatePassword(userData.password)) {
    errors.password =
      "La contraseña debe tener al menos 8 caracteres e incluir letras y números";
    valid = false;
  } else {
    errors.password = "";
  }

  // Validar confirmación de contraseña
  if (!userData.confirmPassword) {
    errors.confirmPassword = "Debes confirmar la contraseña";
    valid = false;
  } else if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
    valid = false;
  } else {
    errors.confirmPassword = "";
  }

  return valid;
};

// Genera un código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para avanzar al siguiente paso
const goToStep = async (step) => {
  if (step === 2 && !validateStep1()) {
    return;
  }

  if (step === 2) {
    // Generamos un código de verificación real
    actualVerificationCode.value = generateVerificationCode();
    
    // Enviamos el email con el código
    await sendVerificationCode();
  }

  currentStep.value = step;
};

// Función para enviar código de verificación
const sendVerificationCode = async () => {
  isLoading.value = true;
  
  try {
    // Enviamos el email con el código generado
    const result = await sendVerificationEmail(
      userData.email, 
      actualVerificationCode.value
    );
    
    if (!result.success) {
      console.error("Error al enviar el email de verificación:", result.error);
      UToast.add({
        title: 'Error al enviar código',
        description: 'No pudimos enviar el código. Inténtalo de nuevo.',
        color: 'red'
      });
    } else {
      console.log("Email de verificación enviado:", result.data);
    }
  } catch (error) {
    console.error("Error al enviar el código:", error);
  } finally {
    isLoading.value = false;
    // Iniciamos el contador para reenvío
    startResendCountdown();
  }
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
const resendCode = () => {
  if (resendCountdown.value > 0) return;
  
  // Generamos un nuevo código
  actualVerificationCode.value = generateVerificationCode();
  sendVerificationCode();
};

// Función para verificar el código
const verifyCode = () => {
  // Validar el código
  if (!verificationCode.value) {
    errors.verificationCode = "Ingresa el código de verificación";
    return;
  }

  if (verificationCode.value.length !== 6) {
    errors.verificationCode = "El código debe tener 6 dígitos";
    return;
  }

  // Verificamos si el código ingresado coincide con el generado
  if (verificationCode.value !== actualVerificationCode.value) {
    errors.verificationCode = "Código incorrecto. Verifica y vuelve a intentar.";
    return;
  }

  errors.verificationCode = "";
  
  // Simulamos verificación del código
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;

    // Simulamos registro exitoso
    // En un escenario real, aquí crearíamos el usuario en Firebase
    console.log("Usuario registrado:", userData);

    // Avanzamos al último paso
    currentStep.value = 3;
  }, 1500);
};
</script>
