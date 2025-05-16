<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-4">Diagnóstico de Firestore</h2>

    <div v-if="isLoading" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
      <span class="ml-2">Cargando...</span>
    </div>

    <div v-else>
      <div
        class="mb-4 p-3 border rounded"
        :class="
          hasFirestore
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
            : 'border-red-500 bg-red-50 dark:bg-red-900/10'
        "
      >
        <p
          class="font-medium"
          :class="
            hasFirestore
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          "
        >
          {{
            hasFirestore
              ? "✅ Firestore disponible"
              : "❌ Firestore no disponible"
          }}
        </p>
        <p
          v-if="errorMessage"
          class="text-red-600 dark:text-red-400 text-sm mt-2"
        >
          Error: {{ errorMessage }}
        </p>
      </div>

      <div v-if="hasFirestore" class="mb-4">
        <UButton
          @click="testFirestore"
          :loading="isTestLoading"
          color="primary"
          size="sm"
        >
          Probar conexión a Firestore
        </UButton>

        <div
          v-if="testResults"
          class="mt-3 p-3 border rounded"
          :class="
            testSuccess
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : 'border-red-500 bg-red-50 dark:bg-red-900/10'
          "
        >
          <p
            class="font-medium"
            :class="
              testSuccess
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            "
          >
            {{ testSuccess ? "✅ Prueba exitosa" : "❌ Prueba fallida" }}
          </p>
          <pre
            class="text-xs mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-40"
            >{{ JSON.stringify(testResults, null, 2) }}</pre
          >
        </div>
      </div>

      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p v-if="hasFirestore">
          <strong>Estado:</strong> La instancia de Firestore está disponible en
          el cliente
        </p>
        <p v-else>
          <strong>Estado:</strong> No se pudo obtener la instancia de Firestore
          en el cliente
        </p>
        <p class="mt-2"><strong>Entorno:</strong> {{ env }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { collection, getDocs, limit, query } from "firebase/firestore";

const { $firestore } = useNuxtApp();
const isLoading = ref(true);
const hasFirestore = ref(false);
const errorMessage = ref("");
const isTestLoading = ref(false);
const testResults = ref(null);
const testSuccess = ref(false);
const env = process.env.NODE_ENV || "no definido";

// Verificar si tenemos acceso a Firestore
onMounted(async () => {
  try {
    console.log("[FirestoreTest] Verificando disponibilidad de Firestore...");

    // Comprobar si tenemos la instancia de Firestore
    hasFirestore.value = !!$firestore;

    if (!hasFirestore.value) {
      errorMessage.value =
        "La instancia de Firestore no está disponible en el cliente";
      console.error("[FirestoreTest] " + errorMessage.value);
    } else {
      console.log("[FirestoreTest] Firestore está disponible en el cliente");
    }
  } catch (error) {
    console.error("[FirestoreTest] Error al verificar Firestore:", error);
    errorMessage.value = error.message || "Error desconocido";
    hasFirestore.value = false;
  } finally {
    isLoading.value = false;
  }
});

// Probar la conexión a Firestore
const testFirestore = async () => {
  if (!hasFirestore.value) return;

  isTestLoading.value = true;
  testResults.value = null;
  testSuccess.value = false;

  try {
    console.log("[FirestoreTest] Probando conexión a Firestore...");

    // Intentar obtener documentos de la colección users
    const usersRef = collection($firestore, "users");
    const q = query(usersRef, limit(1));
    const querySnapshot = await getDocs(q);

    // Preparar resultados
    const results = {
      success: true,
      documentsCount: querySnapshot.size,
      firstDocument: null,
    };

    // Si hay documentos, mostrar el primero (sin datos sensibles)
    if (querySnapshot.size > 0) {
      const doc = querySnapshot.docs[0];
      results.firstDocument = {
        id: doc.id,
        exists: doc.exists(),
        hasEmailField: !!doc.data().email,
        createdAt: doc.data().createdAt ? "timestamp present" : "no timestamp",
        fields: Object.keys(doc.data()),
      };
    }

    testResults.value = results;
    testSuccess.value = true;
    console.log("[FirestoreTest] Prueba exitosa:", results);
  } catch (error) {
    console.error("[FirestoreTest] Error en prueba:", error);
    testResults.value = {
      success: false,
      error: error.message || "Error desconocido",
      code: error.code || "unknown",
      stack: error.stack,
    };
    testSuccess.value = false;
  } finally {
    isTestLoading.value = false;
  }
};
</script>
