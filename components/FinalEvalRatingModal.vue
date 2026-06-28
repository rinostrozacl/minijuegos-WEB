<template>
  <UModal v-model="open" :ui="{ width: 'max-w-lg' }">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold">Evaluación final</h3>
            <p v-if="gameTitle" class="text-sm text-gray-500 mt-1">{{ gameTitle }}</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="-my-1"
            @click="closeModal"
          />
        </div>
      </template>

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
          Ingresa tu correo autorizado. Te enviaremos un código de verificación.
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
          @click="handleRequestOtp"
        >
          Enviar código
        </UButton>
      </div>

      <!-- Paso OTP -->
      <div v-else-if="step === 'otp'" class="space-y-4">
        <UAlert color="blue" variant="soft">
          Se envió un código a <strong>{{ emailInput }}</strong>. Revisa tu bandeja de entrada.
        </UAlert>
        <UFormGroup label="Código de verificación" required>
          <UInput
            v-model="otpInput"
            maxlength="6"
            placeholder="000000"
            :disabled="isSubmitting"
          />
        </UFormGroup>
        <UButton
          block
          color="primary"
          :loading="isSubmitting"
          :disabled="otpInput.trim().length < 6"
          @click="handleVerifyOtp"
        >
          Verificar código
        </UButton>
        <UButton
          block
          variant="ghost"
          color="gray"
          :disabled="otpCooldown > 0 || isSubmitting"
          @click="handleRequestOtp"
        >
          {{
            otpCooldown > 0
              ? `Reenviar código (${otpCooldown}s)`
              : "Reenviar código"
          }}
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

      <template #footer>
        <div v-if="step === 'rating'" class="flex justify-end gap-2">
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
        <div v-else-if="step === 'already'" class="flex justify-end">
          <UButton color="primary" @click="closeModal">Cerrar</UButton>
        </div>
      </template>
    </UCard>
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
  otpCooldown,
  requestOtp,
  verifyOtp,
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

const step = ref<"email" | "otp" | "rating" | "already">("email");
const emailInput = ref("");
const otpInput = ref("");
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

async function initModal() {
  errorMessage.value = "";
  resetScores();
  otpInput.value = "";
  loadSessionFromStorage();
  await fetchEligibility();

  const rated = await checkRated(props.gameId);
  if (rated.hasRated) {
    step.value = "already";
    if (rated.email) emailInput.value = rated.email;
    return;
  }

  if (skipOtp.value && evaluatorEmail.value) {
    emailInput.value = evaluatorEmail.value;
    step.value = "rating";
    progress.value = await fetchProgress();
    return;
  }

  if (evaluatorEmail.value) {
    emailInput.value = evaluatorEmail.value;
    step.value = "otp";
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

async function handleRequestOtp() {
  errorMessage.value = "";
  if (!emailInput.value.trim()) {
    errorMessage.value = "Ingresa tu correo";
    return;
  }
  isSubmitting.value = true;
  try {
    await requestOtp(emailInput.value);
    step.value = "otp";
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMessage.value =
      err?.data?.statusMessage || err?.statusMessage || "Error al solicitar código";
  } finally {
    isSubmitting.value = false;
  }
}

async function handleVerifyOtp() {
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    await verifyOtp(emailInput.value, otpInput.value);
    step.value = "rating";
    progress.value = await fetchProgress();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    errorMessage.value =
      err?.data?.statusMessage || err?.statusMessage || "Código inválido";
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
