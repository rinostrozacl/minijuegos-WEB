<template>
  <UModal
    v-model:open="open"
    title="Calificar este juego"
    :description="gameTitle"
    :ui="{ content: 'max-w-lg w-[calc(100vw-2rem)]' }"
  >
    <template #body>
      <UAlert
        v-if="errorMessage"
        color="red"
        variant="soft"
        :title="errorMessage"
        class="mb-4"
        @close="errorMessage = ''"
      />

      <!-- Paso email -->
      <div v-if="step === 'email'" class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu correo autorizado. Verificaremos que estés en la lista de evaluadores.
        </p>
        <UFormGroup label="Correo electrónico" required>
          <UInput
            v-model="emailInput"
            type="email"
            placeholder="nombre@alumnos.santotomas.cl"
            :disabled="isSubmitting"
          />
        </UFormGroup>
        <UButton
          block
          color="primary"
          :loading="isSubmitting"
          :disabled="!emailInput.trim()"
          @click="handleStartSession"
        >
          Continuar
        </UButton>
      </div>

      <!-- Paso calificación -->
      <div v-else-if="step === 'rating'" class="space-y-5">
        <p v-if="evaluatorEmail" class="text-sm text-gray-600 dark:text-gray-400">
          Calificando como <strong>{{ evaluatorEmail }}</strong>
        </p>
        <p v-if="progress" class="text-sm text-primary">
          Progreso: {{ progress.ratedCount }} de {{ progress.totalPublished }} juegos calificados
        </p>

        <div
          v-for="criterion in criteria"
          :key="criterion.key"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <span class="font-medium">{{ criterion.label }}</span>
          <URating
            v-model="scores[criterion.key]"
            :length="5"
            size="lg"
          />
        </div>
      </div>

      <!-- Ya calificado -->
      <div v-else-if="step === 'already'" class="text-center py-4">
        <UIcon name="i-heroicons-check-circle" class="text-green-500 text-4xl mb-3" />
        <p class="text-gray-700 dark:text-gray-300">
          Ya calificaste este juego en la evaluación final.
        </p>
      </div>
    </template>

    <template v-if="step === 'rating' || step === 'already'" #footer>
      <div v-if="step === 'rating'" class="flex justify-end gap-2 w-full">
        <UButton color="gray" variant="solid" @click="closeModal">Cancelar</UButton>
        <UButton
          color="primary"
          :loading="isSubmitting"
          :disabled="!allScoresFilled"
          @click="handleSubmit"
        >
          Enviar calificación
        </UButton>
      </div>
      <div v-else class="flex justify-end w-full">
        <UButton color="primary" @click="closeModal">Cerrar</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { FINAL_EVAL_CRITERIA } from "~/utils/finalEval";
import type { FinalEvalScores } from "~/composables/useFinalEval";

const props = defineProps<{
  modelValue: boolean;
  gameId: string;
  gameTitle?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const {
  skipOtp,
  evaluatorEmail,
  isSubmitting,
  startSession,
  checkRated,
  submitRating,
  fetchProgress,
  loadSessionFromStorage,
  fetchEligibility,
} = useFinalEval();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const step = ref<"email" | "rating" | "already">("email");
const emailInput = ref("");
const errorMessage = ref("");
const progress = ref<{ totalPublished: number; ratedCount: number; pendingCount: number } | null>(null);

const criteria = FINAL_EVAL_CRITERIA;

const scores = reactive<FinalEvalScores>({
  historia: 0,
  grafica: 0,
  mecanica: 0,
  general: 0,
});

const allScoresFilled = computed(() =>
  criteria.every((c) => scores[c.key] >= 1 && scores[c.key] <= 5)
);

function resetScores() {
  scores.historia = 0;
  scores.grafica = 0;
  scores.mecanica = 0;
  scores.general = 0;
}

function closeModal() {
  open.value = false;
  errorMessage.value = "";
}

async function goToRating(email?: string) {
  if (email) emailInput.value = email;
  step.value = "rating";
  progress.value = await fetchProgress();
}

async function initModal() {
  errorMessage.value = "";
  resetScores();
  loadSessionFromStorage();
  await fetchEligibility();

  const rated = await checkRated(props.gameId);
  if (rated.hasRated) {
    step.value = "already";
    if (rated.email) emailInput.value = rated.email;
    return;
  }

  if (rated.email) {
    await goToRating(rated.email);
    return;
  }

  if (skipOtp.value && evaluatorEmail.value) {
    await goToRating(evaluatorEmail.value);
    return;
  }

  step.value = "email";
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) initModal();
  }
);

async function handleStartSession() {
  errorMessage.value = "";
  if (!emailInput.value.trim()) {
    errorMessage.value = "Ingresa tu correo";
    return;
  }
  isSubmitting.value = true;
  try {
    await startSession(emailInput.value);
    await goToRating(emailInput.value.trim().toLowerCase());
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "No se pudo verificar tu correo";
  } finally {
    isSubmitting.value = false;
  }
}

async function handleSubmit() {
  if (!allScoresFilled.value) return;
  if (!confirm("¿Confirmas enviar estas calificaciones? No podrás modificarlas.")) {
    return;
  }
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    await submitRating(props.gameId, { ...scores });
    emit("success");
    closeModal();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMessage.value =
      err?.data?.statusMessage || err?.statusMessage || "Error al enviar calificación";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
