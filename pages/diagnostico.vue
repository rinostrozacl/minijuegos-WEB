<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Diagnóstico de Firebase</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Estado de autenticación -->
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Estado de autenticación</h2>

        <div v-if="authInitialized">
          <div
            class="p-3 border rounded mb-4"
            :class="
              isAuthenticated
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
            "
          >
            <p
              class="font-medium"
              :class="
                isAuthenticated
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              "
            >
              {{
                isAuthenticated ? "✅ Usuario autenticado" : "⚠️ No autenticado"
              }}
            </p>
          </div>

          <div v-if="isAuthenticated" class="space-y-2">
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>UID:</strong> {{ user.uid }}</p>
            <p>
              <strong>Email verificado:</strong>
              {{ user.emailVerified ? "Sí" : "No" }}
            </p>
            <p><strong>Datos de usuario adicionales:</strong></p>
            <pre
              class="text-xs mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-40"
              >{{ JSON.stringify(userData || "No disponible", null, 2) }}</pre
            >
          </div>

          <div v-else class="mt-4">
            <UButton to="/ingresar" color="primary" size="sm">
              Iniciar sesión
            </UButton>
          </div>
        </div>
        <div v-else class="flex justify-center py-4">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
          <span class="ml-2">Cargando estado de autenticación...</span>
        </div>
      </div>

      <!-- Diagnóstico de Firestore -->
      <FirestoreTest />
    </div>

    <!-- Herramientas de reparación -->
    <div class="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Herramientas de reparación</h2>

      <div class="space-y-4">
        <div>
          <h3 class="font-medium mb-2">Reparación de Firestore</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Esta herramienta intenta solucionar problemas comunes con la
            conexión a Firestore, incluyendo problemas de red y de
            inicialización.
          </p>

          <div
            v-if="fixStatus"
            class="mb-3 p-3 text-sm rounded border"
            :class="
              fixSuccess
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            "
          >
            <p>{{ fixStatus }}</p>
          </div>

          <UButton
            @click="repairFirestore"
            color="primary"
            :loading="isFixing"
            size="sm"
          >
            <template #leading>
              <UIcon name="i-heroicons-wrench-screwdriver" />
            </template>
            Reparar conexión a Firestore
          </UButton>
        </div>
      </div>
    </div>

    <!-- Información de entorno -->
    <div class="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Información de entorno</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium mb-2">Variables Firebase públicas</h3>
          <ul class="space-y-1 text-sm">
            <li>
              <span class="font-mono">API_KEY:</span>
              {{
                !!runtimeConfig.firebaseApiKey
                  ? "✅ Presente"
                  : "❌ No disponible"
              }}
              <span
                v-if="runtimeConfig.firebaseApiKey"
                class="text-xs text-gray-500"
                >({{ runtimeConfig.firebaseApiKey.substring(0, 5) }}...)</span
              >
            </li>
            <li>
              <span class="font-mono">AUTH_DOMAIN:</span>
              {{
                !!runtimeConfig.firebaseAuthDomain
                  ? "✅ Presente"
                  : "❌ No disponible"
              }}
              <span
                v-if="runtimeConfig.firebaseAuthDomain"
                class="text-xs text-gray-500"
                >({{ runtimeConfig.firebaseAuthDomain }})</span
              >
            </li>
            <li>
              <span class="font-mono">PROJECT_ID:</span>
              {{
                !!runtimeConfig.firebaseProjectId
                  ? "✅ Presente"
                  : "❌ No disponible"
              }}
              <span
                v-if="runtimeConfig.firebaseProjectId"
                class="text-xs text-gray-500"
                >({{ runtimeConfig.firebaseProjectId }})</span
              >
            </li>
            <li>
              <span class="font-mono">STORAGE_BUCKET:</span>
              {{
                !!runtimeConfig.firebaseStorageBucket
                  ? "✅ Presente"
                  : "❌ No disponible"
              }}
            </li>
            <li>
              <span class="font-mono">MESSAGING_SENDER_ID:</span>
              {{
                !!runtimeConfig.firebaseMessagingSenderId
                  ? "✅ Presente"
                  : "❌ No disponible"
              }}
            </li>
            <li>
              <span class="font-mono">APP_ID:</span>
              {{
                !!runtimeConfig.firebaseAppId
                  ? "✅ Presente"
                  : "❌ No disponible"
              }}
              <span
                v-if="runtimeConfig.firebaseAppId"
                class="text-xs text-gray-500"
                >({{ runtimeConfig.firebaseAppId.substring(0, 8) }}...)</span
              >
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-medium mb-2">Información del sistema</h3>
          <ul class="space-y-1 text-sm">
            <li>
              <strong>Entorno:</strong>
              {{ appMode }}
            </li>
            <li><strong>Navegador:</strong> {{ getBrowserInfo() }}</li>
            <li>
              <strong>Firestore disponible:</strong>
              {{ !!$firestore ? "Sí" : "No" }}
            </li>
            <li>
              <strong>Auth disponible:</strong> {{ !!$auth ? "Sí" : "No" }}
            </li>
            <li>
              <strong>Storage disponible:</strong>
              {{ !!$storage ? "Sí" : "No" }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="mt-6 flex gap-3">
      <UButton @click="reloadPage" color="gray" size="sm">
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" />
        </template>
        Actualizar página
      </UButton>

      <UButton
        v-if="isAuthenticated"
        @click="refreshUserInfo"
        color="primary"
        size="sm"
        :loading="isRefreshing"
      >
        <template #leading>
          <UIcon name="i-heroicons-user-circle" />
        </template>
        Refrescar información de usuario
      </UButton>

      <UButton to="/" color="gray" variant="outline" size="sm">
        <template #leading>
          <UIcon name="i-heroicons-home" />
        </template>
        Volver al inicio
      </UButton>
    </div>
  </div>
</template>

<script setup>
import FirestoreTest from "~/components/display/FirestoreTest.vue";
import { useFirestoreFix } from "~/composables/useFirestoreFix";

definePageMeta({
  title: "Diagnóstico Firebase",
  description:
    "Herramienta de diagnóstico para verificar la conexión a Firebase",
});

const { $auth, $firestore, $storage } = useNuxtApp();
const runtimeConfig = useRuntimeConfig().public;
const isRefreshing = ref(false);
const appMode = ref(runtimeConfig.appMode || "development");

// Estado de autenticación
const { user, userData, isAuthenticated, authInitialized, refreshUserState } =
  useAuth();

// Información del navegador
const getBrowserInfo = () => {
  if (process.server) return "Ejecutando en servidor";

  const userAgent = navigator.userAgent;
  let browserName = "Desconocido";

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "Safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "Opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "Edge";
  }

  return browserName;
};

// Refrescar información del usuario
const refreshUserInfo = async () => {
  if (!isAuthenticated.value) return;

  isRefreshing.value = true;
  try {
    await refreshUserState();
  } catch (error) {
    console.error("Error al refrescar información del usuario:", error);
  } finally {
    isRefreshing.value = false;
  }
};

// Recargar página
const reloadPage = () => {
  window.location.reload();
};

// Herramientas de reparación
const { checkAndFixFirestore, isFixing, fixStatus } = useFirestoreFix();
const fixSuccess = ref(false);

const repairFirestore = async () => {
  try {
    const result = await checkAndFixFirestore();
    fixSuccess.value = result.success;
  } catch (error) {
    console.error("Error al reparar la conexión a Firestore:", error);
    fixSuccess.value = false;
  }
};
</script>
