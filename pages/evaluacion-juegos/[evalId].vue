<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6">
      <UButton
        to="/evaluacion-juegos"
        variant="ghost"
        color="gray"
        icon="i-heroicons-arrow-left"
        class="mb-4"
      >
        Volver
      </UButton>
      <h1 class="text-2xl font-bold">{{ detail?.evaluation.name || "Evaluación" }}</h1>
      <p v-if="detail" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ completedCount }} de {{ totalCount }} juegos evaluados
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl text-primary" />
    </div>

    <div v-else-if="!detail" class="text-center py-16 text-gray-500">
      Evaluación no encontrada o sin asignación.
    </div>

    <div v-else-if="!detail.evaluation.isIntakeEnabled" class="text-center py-16">
      <UBadge color="amber" size="lg" class="mb-4">Ingreso pausado</UBadge>
      <p class="text-gray-600 dark:text-gray-400">
        El docente ha pausado el ingreso de notas. Tus evaluaciones ya enviadas siguen visibles abajo.
      </p>
    </div>

    <div v-else class="space-y-6">
      <UCard v-for="game in detail.games" :key="game.id">
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs text-gray-500">Temática #{{ game.numero }}</p>
              <h2 class="text-lg font-semibold">{{ game.title }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formatResponsables(game) }}
              </p>
            </div>
            <UBadge v-if="isCompleted(game.id)" color="green">Evaluado</UBadge>
            <UBadge v-else color="gray">Pendiente</UBadge>
          </div>
        </template>

        <!-- Solo lectura si ya evaluó -->
        <div v-if="isCompleted(game.id)" class="space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div v-for="c in PEER_EVAL_CRITERIA" :key="c.key">
              <span class="text-gray-500">{{ c.label }}:</span>
              <span class="font-semibold ml-1">{{ getSubmission(game.id)?.scores[c.key] }}/7</span>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Lo que más me gustó</p>
            <p class="text-sm mt-1">{{ getSubmission(game.id)?.likedMost }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Lo que menos me gustó</p>
            <p class="text-sm mt-1">{{ getSubmission(game.id)?.likedLeast }}</p>
          </div>
          <p class="text-xs text-gray-400">
            Promedio: {{ getSubmission(game.id)?.averageScore?.toFixed(2) }}
          </p>
        </div>

        <!-- Formulario pendiente -->
        <form v-else-if="detail.evaluation.isIntakeEnabled" class="space-y-5" @submit.prevent="submitGame(game.id)">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Juega este juego fuera de la plataforma y luego registra tu evaluación. Una vez guardada, no podrás modificarla.
          </p>

          <div v-for="c in PEER_EVAL_CRITERIA" :key="c.key" class="space-y-2">
            <div class="flex justify-between items-baseline">
              <label class="font-medium text-sm">{{ c.label }}</label>
              <span class="text-sm text-primary font-semibold">{{ forms[game.id]?.scores[c.key] ?? 4 }}/7</span>
            </div>
            <p class="text-xs text-gray-500">{{ c.description }}</p>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              class="w-full accent-primary"
              :value="forms[game.id]?.scores[c.key] ?? 4"
              @input="updateScore(game.id, c.key, ($event.target as HTMLInputElement).value)"
            />
            <div class="flex justify-between text-xs text-gray-400 px-0.5">
              <span>1</span><span>7</span>
            </div>
          </div>

          <UFormGroup label="Lo que más me gustó" required>
            <UTextarea
              v-model="forms[game.id].likedMost"
              :rows="3"
              placeholder="Describe lo que más te gustó del juego"
            />
          </UFormGroup>

          <UFormGroup label="Lo que menos me gustó" required>
            <UTextarea
              v-model="forms[game.id].likedLeast"
              :rows="3"
              placeholder="Describe lo que menos te gustó del juego"
            />
          </UFormGroup>

          <UButton
            type="submit"
            color="primary"
            block
            :loading="submittingGameId === game.id"
          >
            Guardar evaluación
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  usePeerEvaluations,
  type MyEvalDetail,
} from "~/composables/usePeerEvaluations";
import { PEER_EVAL_CRITERIA, type PeerEvalScores } from "~/utils/peerEval";

definePageMeta({
  title: "Evaluación de juegos",
  middleware: ["auth"],
});

const route = useRoute();
const toast = useToast();
const evalId = computed(() => String(route.params.evalId));

const { getMyEvaluationDetail, submitEvaluation } = usePeerEvaluations();

const loading = ref(true);
const detail = ref<MyEvalDetail | null>(null);
const submittingGameId = ref<string | null>(null);

type GameForm = {
  scores: PeerEvalScores;
  likedMost: string;
  likedLeast: string;
};

const forms = reactive<Record<string, GameForm>>({});

const completedCount = computed(
  () => detail.value?.assignment.completedGameIds?.length ?? 0
);
const totalCount = computed(
  () => detail.value?.assignment.assignedGameIds?.length ?? 0
);

function defaultScores(): PeerEvalScores {
  return { jugabilidad: 4, funcionamiento: 4, claridad: 4, implementacion: 4 };
}

function initForms(data: MyEvalDetail) {
  for (const game of data.games) {
    if (!data.assignment.completedGameIds.includes(game.id)) {
      forms[game.id] = {
        scores: defaultScores(),
        likedMost: "",
        likedLeast: "",
      };
    }
  }
}

function isCompleted(gameId: string) {
  return detail.value?.assignment.completedGameIds?.includes(gameId) ?? false;
}

function getSubmission(gameId: string) {
  return detail.value?.submissions.find((s) => s.gameId === gameId);
}

function formatResponsables(game: {
  reservedBy: string;
  teammateName: string;
}) {
  return [game.reservedBy, game.teammateName].filter(Boolean).join(" · ") || "—";
}

function updateScore(
  gameId: string,
  key: keyof PeerEvalScores,
  value: string
) {
  if (!forms[gameId]) return;
  forms[gameId].scores[key] = Number(value);
}

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getMyEvaluationDetail(evalId.value);
    initForms(detail.value);
  } catch {
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

async function submitGame(gameId: string) {
  const form = forms[gameId];
  if (!form) return;

  if (!form.likedMost.trim() || !form.likedLeast.trim()) {
    toast.add({
      title: "Comentarios obligatorios",
      description: "Completa ambos comentarios antes de guardar.",
      color: "amber",
    });
    return;
  }

  submittingGameId.value = gameId;
  try {
    await submitEvaluation({
      evalId: evalId.value,
      gameId,
      scores: { ...form.scores },
      likedMost: form.likedMost.trim(),
      likedLeast: form.likedLeast.trim(),
    });
    toast.add({ title: "Evaluación guardada", color: "green" });
    delete forms[gameId];
    await loadDetail();
  } catch (e: unknown) {
    toast.add({
      title: "No se pudo guardar",
      description: (e as Error).message,
      color: "red",
    });
  } finally {
    submittingGameId.value = null;
  }
}

onMounted(loadDetail);
</script>
