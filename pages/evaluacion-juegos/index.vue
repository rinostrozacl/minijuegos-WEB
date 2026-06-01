<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-2xl font-bold mb-2">Evaluación de juegos</h1>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Evalúa los juegos asignados por tu docente. Juega fuera de esta plataforma e ingresa tus notas aquí.
    </p>

    <div v-if="!isLoggedIn" class="text-center py-16">
      <p class="text-lg mb-4">Debes iniciar sesión para acceder a las evaluaciones.</p>
      <UButton to="/ingresar" color="primary">Iniciar sesión</UButton>
    </div>

    <div v-else-if="loading" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl text-primary" />
    </div>

    <div v-else-if="evaluations.length === 0" class="text-center py-16">
      <UIcon name="i-heroicons-clipboard-document-list" class="text-5xl text-gray-400 mb-4" />
      <p class="text-lg text-gray-600 dark:text-gray-400">
        No tienes evaluaciones disponibles en este momento.
      </p>
    </div>

    <div v-else class="space-y-3">
      <UCard
        v-for="ev in evaluations"
        :key="ev.id"
        class="hover:ring-2 hover:ring-primary/30 transition cursor-pointer"
        @click="navigateTo(`/evaluacion-juegos/${ev.id}`)"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">{{ ev.name }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Progreso: {{ ev.progress.completed }} de {{ ev.progress.total }} juegos evaluados
            </p>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="text-xl text-gray-400" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePeerEvaluations, type MyEvalListItem } from "~/composables/usePeerEvaluations";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  title: "Evaluación de juegos",
  description: "Evaluación entre pares de juegos GameCraft2026",
  middleware: ["auth"],
});

const { isAuthenticated: isLoggedIn, waitForAuthInitialized } = useAuth();
const { getMyEvaluations } = usePeerEvaluations();

const loading = ref(true);
const evaluations = ref<MyEvalListItem[]>([]);

onMounted(async () => {
  await waitForAuthInitialized();
  if (!isLoggedIn.value) {
    loading.value = false;
    return;
  }
  try {
    const res = await getMyEvaluations();
    evaluations.value = res.evaluations;
  } catch {
    // Sin evaluaciones o error de red
  } finally {
    loading.value = false;
  }
});
</script>
