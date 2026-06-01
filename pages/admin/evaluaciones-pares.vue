<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Evaluación entre pares</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Crear instancias, asignar juegos aleatoriamente y revisar reportes
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" @click="openCreateModal">
        Nueva evaluación
      </UButton>
    </div>

    <UCard>
      <div v-if="loadingList" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-primary" />
      </div>

      <div v-else-if="evaluations.length === 0" class="text-center py-12 text-gray-500">
        No hay evaluaciones creadas
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Estado</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Juegos</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Evaluadores</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Progreso</th>
              <th class="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="ev in evaluations" :key="ev.id">
              <td class="px-4 py-3 font-medium">{{ ev.name }}</td>
              <td class="px-4 py-3">
                <UBadge :color="peerEvalStatusColor(ev.status as PeerEvalStatus)">
                  {{ PEER_EVAL_STATUS_LABELS[ev.status as PeerEvalStatus] || ev.status }}
                </UBadge>
              </td>
              <td class="px-4 py-3">{{ ev.gameCount }}</td>
              <td class="px-4 py-3">{{ ev.evaluatorCount }}</td>
              <td class="px-4 py-3">
                <span v-if="ev.evaluatorCount > 0">
                  {{ ev.completedEvaluators }}/{{ ev.evaluatorCount }} ({{ ev.progressPercent }}%)
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap justify-end gap-1">
                  <UButton
                    v-if="ev.status === 'borrador'"
                    size="xs"
                    variant="soft"
                    @click="openEditModal(ev)"
                  >
                    Editar
                  </UButton>
                  <UButton
                    v-if="ev.status === 'borrador'"
                    size="xs"
                    color="primary"
                    :loading="actionLoading === ev.id"
                    @click="handleGenerate(ev.id)"
                  >
                    Generar
                  </UButton>
                  <UButton
                    v-if="ev.status === 'generada'"
                    size="xs"
                    color="green"
                    :loading="actionLoading === ev.id"
                    @click="handleStart(ev.id)"
                  >
                    Iniciar
                  </UButton>
                  <UButton
                    v-if="ev.status === 'activa' && ev.isIntakeEnabled"
                    size="xs"
                    color="amber"
                    :loading="actionLoading === ev.id"
                    @click="handleSetIntake(ev.id, false)"
                  >
                    Pausar ingreso
                  </UButton>
                  <UButton
                    v-if="ev.status === 'pausada' || (ev.status === 'activa' && !ev.isIntakeEnabled)"
                    size="xs"
                    color="green"
                    :loading="actionLoading === ev.id"
                    @click="handleSetIntake(ev.id, true)"
                  >
                    Habilitar ingreso
                  </UButton>
                  <UButton
                    v-if="['generada', 'activa', 'pausada'].includes(ev.status)"
                    size="xs"
                    color="orange"
                    :loading="actionLoading === ev.id"
                    @click="confirmReset(ev)"
                  >
                    Reiniciar
                  </UButton>
                  <UButton
                    v-if="['activa', 'pausada'].includes(ev.status)"
                    size="xs"
                    color="purple"
                    :loading="actionLoading === ev.id"
                    @click="handleFinalize(ev.id)"
                  >
                    Finalizar
                  </UButton>
                  <UButton
                    v-if="ev.status === 'finalizada'"
                    size="xs"
                    variant="soft"
                    @click="openReport(ev.id)"
                  >
                    Reporte
                  </UButton>
                  <UButton
                    v-if="ev.status !== 'finalizada'"
                    size="xs"
                    color="red"
                    variant="ghost"
                    @click="confirmCancel(ev)"
                  >
                    Eliminar
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal crear / editar -->
    <UModal v-model="showFormModal">
      <template #content>
        <UCard class="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ editingEval ? "Editar evaluación" : "Nueva evaluación" }}
            </h2>
          </template>

          <div class="space-y-4 p-1">
            <UFormGroup label="Nombre">
              <UInput v-model="form.name" placeholder="Ej. Evaluación Etapa 4" />
            </UFormGroup>

            <UFormGroup label="Juegos por evaluador">
              <UInput v-model.number="form.gamesPerEvaluator" type="number" min="1" max="20" />
            </UFormGroup>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="font-medium">Juegos a evaluar</label>
                <UButton size="xs" variant="ghost" @click="toggleSelectAll">
                  {{ allSelected ? "Desmarcar todos" : "Marcar todos" }}
                </UButton>
              </div>

              <div v-if="loadingGames" class="py-8 text-center text-gray-500">
                Cargando juegos reservados...
              </div>

              <div
                v-else
                class="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700"
              >
                <label
                  v-for="game in reservedGames"
                  :key="game.id"
                  class="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  @click.prevent="toggleGame(game.id, !form.selectedGameIds.includes(game.id))"
                >
                  <input
                    type="checkbox"
                    class="mt-1 rounded border-gray-300"
                    :checked="form.selectedGameIds.includes(game.id)"
                    @click.stop
                    @change="toggleGame(game.id, ($event.target as HTMLInputElement).checked)"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-sm">
                      #{{ game.numero }} — {{ game.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ game.responsables || "Sin responsables" }}
                    </p>
                  </div>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ form.selectedGameIds.length }} juego(s) seleccionado(s)
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showFormModal = false">Cancelar</UButton>
              <UButton color="primary" :loading="savingForm" @click="saveForm">
                {{ editingEval ? "Guardar" : "Crear borrador" }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Modal reporte -->
    <UModal v-model="showReportModal">
      <template #content>
        <UCard class="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <template #header>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 class="text-lg font-semibold">
                Reporte — {{ report?.evaluation.name }}
              </h2>
              <div class="flex gap-2">
                <USelect
                  v-model="reportSort"
                  :options="sortOptions"
                  class="w-48"
                  @change="loadReport(reportEvalId!)"
                />
                <UButton
                  color="green"
                  icon="i-heroicons-arrow-down-tray"
                  @click="exportReportCsv"
                >
                  CSV
                </UButton>
              </div>
            </div>
          </template>

          <div v-if="loadingReport" class="py-12 text-center">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
          </div>

          <div v-else-if="report" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UCard>
                <p class="text-sm text-gray-500">Evaluadores</p>
                <p class="text-xl font-bold">{{ report.summary.totalEvaluators }}</p>
              </UCard>
              <UCard>
                <p class="text-sm text-gray-500">Completaron todo</p>
                <p class="text-xl font-bold">{{ report.summary.completedEvaluators }}</p>
              </UCard>
              <UCard>
                <p class="text-sm text-gray-500">Evaluaciones recibidas</p>
                <p class="text-xl font-bold">{{ report.summary.totalSubmissions }}</p>
              </UCard>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left">#</th>
                    <th class="px-3 py-2 text-left">Juego</th>
                    <th class="px-3 py-2 text-left">Responsables</th>
                    <th class="px-3 py-2 text-right">Nota final</th>
                    <th class="px-3 py-2 text-right">N eval.</th>
                    <th class="px-3 py-2 text-right">Jug.</th>
                    <th class="px-3 py-2 text-right">Func.</th>
                    <th class="px-3 py-2 text-right">Clar.</th>
                    <th class="px-3 py-2 text-right">Impl.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="row in report.rows" :key="row.gameId">
                    <td class="px-3 py-2">{{ row.numero }}</td>
                    <td class="px-3 py-2 font-medium">{{ row.title }}</td>
                    <td class="px-3 py-2 text-gray-500">{{ row.responsables }}</td>
                    <td class="px-3 py-2 text-right font-semibold">{{ row.finalAverage.toFixed(2) }}</td>
                    <td class="px-3 py-2 text-right">{{ row.evaluationCount }}</td>
                    <td class="px-3 py-2 text-right">{{ row.criteriaAvg.jugabilidad.toFixed(2) }}</td>
                    <td class="px-3 py-2 text-right">{{ row.criteriaAvg.funcionamiento.toFixed(2) }}</td>
                    <td class="px-3 py-2 text-right">{{ row.criteriaAvg.claridad.toFixed(2) }}</td>
                    <td class="px-3 py-2 text-right">{{ row.criteriaAvg.implementacion.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <template #footer>
            <UButton variant="ghost" @click="showReportModal = false">Cerrar</UButton>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  usePeerEvaluations,
  type PeerEvalListItem,
  type PeerEvalReport,
} from "~/composables/usePeerEvaluations";
import {
  PEER_EVAL_STATUS_LABELS,
  peerEvalStatusColor,
  type PeerEvalStatus,
} from "~/utils/peerEval";

definePageMeta({
  middleware: ["admin"],
  layout: "admin",
});

const toast = useToast();
const {
  listEvaluations,
  listReservedGames,
  createEvaluation,
  updateEvaluation,
  generateEvaluation,
  startEvaluation,
  setIntake,
  finalizeEvaluation,
  resetEvaluation,
  cancelEvaluation,
  getReport,
} = usePeerEvaluations();

const evaluations = ref<PeerEvalListItem[]>([]);
const reservedGames = ref<
  Array<{ id: string; numero: number | string; title: string; responsables: string }>
>([]);
const loadingList = ref(true);
const loadingGames = ref(false);
const actionLoading = ref<string | null>(null);
const savingForm = ref(false);

const showFormModal = ref(false);
const editingEval = ref<PeerEvalListItem | null>(null);
const form = reactive({
  name: "",
  gamesPerEvaluator: 3,
  selectedGameIds: [] as string[],
});

const showReportModal = ref(false);
const reportEvalId = ref<string | null>(null);
const report = ref<PeerEvalReport | null>(null);
const loadingReport = ref(false);
const reportSort = ref("score_desc");

const sortOptions = [
  { label: "Nota más alta → baja", value: "score_desc" },
  { label: "Nombre del juego", value: "name" },
  { label: "Número del juego", value: "numero" },
];

const allSelected = computed(
  () =>
    reservedGames.value.length > 0 &&
    form.selectedGameIds.length === reservedGames.value.length
);

async function loadList() {
  loadingList.value = true;
  try {
    const res = await listEvaluations();
    evaluations.value = res.evaluations;
  } catch {
    toast.add({ title: "Error al cargar evaluaciones", color: "red" });
  } finally {
    loadingList.value = false;
  }
}

async function loadGames() {
  loadingGames.value = true;
  try {
    const res = await listReservedGames();
    reservedGames.value = res.games;
  } catch {
    toast.add({ title: "Error al cargar juegos", color: "red" });
  } finally {
    loadingGames.value = false;
  }
}

function openCreateModal() {
  editingEval.value = null;
  form.name = "";
  form.gamesPerEvaluator = 3;
  form.selectedGameIds = [];
  showFormModal.value = true;
  loadGames();
}

function openEditModal(ev: PeerEvalListItem) {
  editingEval.value = ev;
  form.name = ev.name;
  form.gamesPerEvaluator = ev.gamesPerEvaluator;
  form.selectedGameIds = [...ev.gameIds];
  showFormModal.value = true;
  loadGames();
}

function toggleGame(id: string, checked: boolean) {
  if (checked && !form.selectedGameIds.includes(id)) {
    form.selectedGameIds.push(id);
  } else if (!checked) {
    form.selectedGameIds = form.selectedGameIds.filter((g) => g !== id);
  }
}

function toggleSelectAll() {
  if (allSelected.value) {
    form.selectedGameIds = [];
  } else {
    form.selectedGameIds = reservedGames.value.map((g) => g.id);
  }
}

async function saveForm() {
  if (!form.name.trim()) {
    toast.add({ title: "El nombre es obligatorio", color: "amber" });
    return;
  }
  savingForm.value = true;
  try {
    if (editingEval.value) {
      await updateEvaluation({
        evalId: editingEval.value.id,
        name: form.name.trim(),
        gamesPerEvaluator: form.gamesPerEvaluator,
        gameIds: form.selectedGameIds,
      });
      toast.add({ title: "Evaluación actualizada", color: "green" });
    } else {
      await createEvaluation({
        name: form.name.trim(),
        gamesPerEvaluator: form.gamesPerEvaluator,
        gameIds: form.selectedGameIds,
      });
      toast.add({ title: "Evaluación creada", color: "green" });
    }
    showFormModal.value = false;
    await loadList();
  } catch (e: unknown) {
    toast.add({
      title: "Error",
      description: (e as Error).message,
      color: "red",
    });
  } finally {
    savingForm.value = false;
  }
}

async function runAction(id: string, fn: () => Promise<unknown>, successMsg: string) {
  actionLoading.value = id;
  try {
    await fn();
    toast.add({ title: successMsg, color: "green" });
    await loadList();
  } catch (e: unknown) {
    toast.add({
      title: "Error",
      description: (e as Error).message,
      color: "red",
    });
  } finally {
    actionLoading.value = null;
  }
}

function handleGenerate(id: string) {
  return runAction(id, () => generateEvaluation(id), "Asignaciones generadas");
}

function handleStart(id: string) {
  return runAction(id, () => startEvaluation(id), "Evaluación iniciada");
}

function handleSetIntake(id: string, enabled: boolean) {
  return runAction(
    id,
    () => setIntake(id, enabled),
    enabled ? "Ingreso habilitado" : "Ingreso pausado"
  );
}

function handleFinalize(id: string) {
  return runAction(id, () => finalizeEvaluation(id), "Evaluación finalizada");
}

function confirmReset(ev: PeerEvalListItem) {
  if (
    !confirm(
      `¿Reiniciar "${ev.name}"? Se borrarán todas las notas, comentarios y asignaciones, y se generarán nuevas asignaciones aleatorias.`
    )
  ) {
    return;
  }
  runAction(ev.id, () => resetEvaluation(ev.id), "Evaluación reiniciada");
}

function confirmCancel(ev: PeerEvalListItem) {
  if (
    !confirm(
      `¿Eliminar permanentemente "${ev.name}"? Esta acción no se puede deshacer.`
    )
  ) {
    return;
  }
  runAction(ev.id, () => cancelEvaluation(ev.id), "Evaluación eliminada");
}

async function openReport(evalId: string) {
  reportEvalId.value = evalId;
  showReportModal.value = true;
  await loadReport(evalId);
}

async function loadReport(evalId: string) {
  loadingReport.value = true;
  try {
    report.value = await getReport(evalId, reportSort.value);
  } catch (e: unknown) {
    toast.add({ title: "Error al cargar reporte", description: (e as Error).message, color: "red" });
  } finally {
    loadingReport.value = false;
  }
}

function exportReportCsv() {
  if (!report.value) return;
  const headers = [
    "Numero",
    "Juego",
    "Responsables",
    "Nota final",
    "Evaluaciones",
    "Jugabilidad",
    "Funcionamiento",
    "Claridad",
    "Implementacion",
  ];
  const lines = report.value.rows.map((r) =>
    [
      r.numero,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.responsables.replace(/"/g, '""')}"`,
      r.finalAverage,
      r.evaluationCount,
      r.criteriaAvg.jugabilidad,
      r.criteriaAvg.funcionamiento,
      r.criteriaAvg.claridad,
      r.criteriaAvg.implementacion,
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evaluacion-pares-${report.value.evaluation.name.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(loadList);
</script>
