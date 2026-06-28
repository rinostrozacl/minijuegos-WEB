<template>
  <div class="space-y-6">
    <!-- Modo presentación fullscreen -->
    <div
      v-if="presentationMode"
      class="fixed inset-0 z-50 bg-gray-950 text-white overflow-auto"
      @keydown.esc="presentationMode = false"
      tabindex="0"
      ref="presentationRef"
    >
      <div class="p-8 max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-4xl font-bold">GameCraft2026 — Resultados</h1>
          <div class="flex gap-2">
            <UButton color="gray" variant="ghost" icon="i-heroicons-chevron-left" @click="prevTab" />
            <UButton color="gray" variant="ghost" icon="i-heroicons-chevron-right" @click="nextTab" />
            <UButton color="gray" variant="soft" @click="presentationMode = false">Salir (ESC)</UButton>
          </div>
        </div>

        <p class="text-xl text-gray-300 mb-2">{{ tabLabels[activeTab] }}</p>

        <div v-if="activeTab === 'intro'" class="space-y-6 text-2xl leading-relaxed">
          <p class="whitespace-pre-line">{{ introText }}</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="bg-gray-800 rounded-xl p-6">
              <p class="text-4xl font-bold">{{ summary.totalVotes }}</p>
              <p class="text-gray-400 mt-2">Votos totales</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6">
              <p class="text-4xl font-bold">{{ summary.uniqueVoters }}</p>
              <p class="text-gray-400 mt-2">Evaluadores</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6">
              <p class="text-4xl font-bold">{{ summary.gamesRated }}</p>
              <p class="text-gray-400 mt-2">Juegos evaluados</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-6">
              <p class="text-4xl font-bold">{{ summary.totalPublishedGames }}</p>
              <p class="text-gray-400 mt-2">Juegos publicados</p>
            </div>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-xl">
            <thead>
              <tr class="border-b border-gray-700 text-left">
                <th class="py-4 pr-4">#</th>
                <th class="py-4 pr-4">Juego</th>
                <th v-if="activeTab === 'general'" class="py-4 px-2">Hist.</th>
                <th v-if="activeTab === 'general'" class="py-4 px-2">Gráf.</th>
                <th v-if="activeTab === 'general'" class="py-4 px-2">Mec.</th>
                <th v-if="activeTab !== 'general'" class="py-4 px-2">Promedio</th>
                <th v-if="activeTab === 'general'" class="py-4 px-2">Gen.</th>
                <th class="py-4 px-2">Votos</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in presentationRows"
                :key="row.gameId"
                class="border-b border-gray-800"
              >
                <td class="py-3 pr-4 text-gray-400">{{ idx + 1 }}</td>
                <td class="py-3 pr-4 font-medium">{{ row.title }}</td>
                <template v-if="activeTab === 'general'">
                  <td class="py-3 px-2">{{ row.averages.historia || "—" }}</td>
                  <td class="py-3 px-2">{{ row.averages.grafica || "—" }}</td>
                  <td class="py-3 px-2">{{ row.averages.mecanica || "—" }}</td>
                  <td class="py-3 px-2">{{ row.averages.general || "—" }}</td>
                </template>
                <td v-else class="py-3 px-2 font-semibold text-primary-400">
                  {{ criterionValue(row) || "—" }}
                </td>
                <td class="py-3 px-2 text-gray-400">{{ row.voteCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Panel admin normal -->
    <template v-if="!presentationMode">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 class="text-2xl font-bold">Evaluación final</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Gestión de evaluadores, estados y resultados para el día de revelación
            </p>
          </div>
          <UBadge :color="statusColor" size="lg">
            {{ statusLabel }}
          </UBadge>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-if="dashboard" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <p class="text-sm text-gray-500">Evaluadores autorizados</p>
          <p class="text-2xl font-bold">{{ dashboard.allowlistCount }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">Ya votaron (≥1 juego)</p>
          <p class="text-2xl font-bold">{{ dashboard.votersCount }}</p>
          <p class="text-sm text-primary">{{ dashboard.participationPct }}% participación</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">Votos registrados</p>
          <p class="text-2xl font-bold">{{ dashboard.totalVotes }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">Juegos con pocos votos</p>
          <p class="text-2xl font-bold">{{ dashboard.lowVoteGames.length }}</p>
          <p class="text-xs text-gray-500">&lt; {{ dashboard.lowVotesThreshold }} votos</p>
        </UCard>
      </div>

      <!-- Gestión estado -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">Estado de la evaluación</h2>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormGroup label="Estado">
            <USelect v-model="statusDraft" :options="statusOptions" />
          </UFormGroup>
          <UFormGroup label="Umbral alerta votos bajos">
            <UInput v-model.number="lowVotesThresholdDraft" type="number" min="0" />
          </UFormGroup>
          <div class="flex items-end">
            <UButton color="primary" :loading="savingStatus" @click="saveStatus">
              Guardar configuración
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Allowlist -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="font-semibold">Correos evaluadores</h2>
            <UButton size="sm" icon="i-heroicons-plus" @click="showAddEmail = true">
              Agregar
            </UButton>
          </div>
        </template>

        <UFormGroup label="Importación masiva (uno por línea)" class="mb-4">
          <UTextarea v-model="bulkText" :rows="4" placeholder="i.coronado3@alumnos.santotomas.cl&#10;..." />
          <UButton class="mt-2" variant="soft" :loading="bulkLoading" @click="runBulkImport">
            Importar listado
          </UButton>
        </UFormGroup>

        <UTable :rows="allowedEmails" :columns="emailColumns" :loading="loadingEmails">
          <template #actions-data="{ row }">
            <UButton
              color="red"
              variant="ghost"
              size="xs"
              icon="i-heroicons-trash"
              @click="removeEmailRow(row)"
            />
          </template>
        </UTable>

        <div v-if="dashboard?.pendingEvaluators?.length" class="mt-4">
          <h3 class="font-medium mb-2">Evaluadores sin votos aún ({{ dashboard.pendingEvaluators.length }})</h3>
          <p class="text-sm text-gray-500 break-all">
            {{ dashboard.pendingEvaluators.join(", ") }}
          </p>
        </div>
      </UCard>

      <!-- Resultados tabs -->
      <UCard>
        <template #header>
          <div class="flex flex-wrap justify-between items-center gap-2">
            <h2 class="font-semibold">Resultados</h2>
            <div class="flex gap-2">
              <UButton variant="soft" icon="i-heroicons-arrow-down-tray" @click="exportCsv">
                Exportar CSV
              </UButton>
              <UButton color="primary" icon="i-heroicons-presentation-chart-bar" @click="enterPresentation">
                Presentar
              </UButton>
            </div>
          </div>
        </template>

        <UFormGroup label="Texto introducción (día revelación)" class="mb-4">
          <UTextarea v-model="introTextDraft" :rows="3" />
          <UButton class="mt-2" size="sm" variant="soft" @click="saveIntroOnly">Guardar texto</UButton>
        </UFormGroup>

        <UTabs v-model="activeTab" :items="tabItems" class="mb-4" />

        <div v-if="activeTab === 'intro'" class="prose dark:prose-invert max-w-none">
          <p class="whitespace-pre-line">{{ introText }}</p>
          <div class="not-prose grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold">{{ summary.totalVotes }}</p>
              <p class="text-sm text-gray-500">Votos</p>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold">{{ summary.uniqueVoters }}</p>
              <p class="text-sm text-gray-500">Evaluadores</p>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold">{{ summary.gamesRated }}</p>
              <p class="text-sm text-gray-500">Juegos evaluados</p>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p class="text-2xl font-bold">{{ summary.totalPublishedGames }}</p>
              <p class="text-sm text-gray-500">Publicados</p>
            </div>
          </div>
        </div>

        <UTable v-else :rows="sortedRows" :columns="resultColumns" />
      </UCard>
    </template>

    <UModal v-model="showAddEmail">
      <UCard>
        <template #header>Agregar evaluador</template>
        <UFormGroup label="Correo">
          <UInput v-model="newEmail" type="email" />
        </UFormGroup>
        <template #footer>
          <UButton color="gray" variant="ghost" @click="showAddEmail = false">Cancelar</UButton>
          <UButton color="primary" :loading="addingEmail" @click="submitAddEmail">Agregar</UButton>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  FINAL_EVAL_STATUS_LABELS,
  finalEvalStatusColor,
  type FinalEvalStatus,
} from "~/utils/finalEval";

definePageMeta({ layout: "admin", middleware: ["admin"] });

const toast = useToast();
const {
  fetchConfig,
  setStatus,
  fetchDashboard,
  fetchAllowedEmails,
  addEmail,
  bulkImport,
  removeEmail,
  fetchResults,
  showError,
} = useFinalEvalAdmin();

const status = ref<FinalEvalStatus>("cerrada");
const statusDraft = ref<FinalEvalStatus>("cerrada");
const introText = ref("");
const introTextDraft = ref("");
const lowVotesThresholdDraft = ref(3);
const dashboard = ref<Awaited<ReturnType<typeof fetchDashboard>> | null>(null);
const allowedEmails = ref<{ id: string; email: string; enabled: boolean }[]>([]);
const resultRows = ref<Awaited<ReturnType<typeof fetchResults>>["rows"]>([]);
const summary = ref({
  totalVotes: 0,
  uniqueVoters: 0,
  gamesRated: 0,
  totalPublishedGames: 0,
});

const loadingEmails = ref(false);
const savingStatus = ref(false);
const bulkLoading = ref(false);
const bulkText = ref("");
const showAddEmail = ref(false);
const newEmail = ref("");
const addingEmail = ref(false);
const presentationMode = ref(false);
const presentationRef = ref<HTMLElement | null>(null);

const activeTab = ref("intro");
const tabItems = [
  { label: "Introducción", value: "intro" },
  { label: "Historia", value: "historia" },
  { label: "Gráfica", value: "grafica" },
  { label: "Mecánica", value: "mecanica" },
  { label: "General", value: "general" },
];
const tabLabels: Record<string, string> = {
  intro: "Introducción",
  historia: "Historia",
  grafica: "Gráfica",
  mecanica: "Mecánica",
  general: "Compilado general",
};

const statusOptions = [
  { label: "Cerrada", value: "cerrada" },
  { label: "Abierta", value: "abierta" },
  { label: "Finalizada", value: "finalizada" },
];

const statusLabel = computed(() => FINAL_EVAL_STATUS_LABELS[status.value]);
const statusColor = computed(() => finalEvalStatusColor(status.value));

const emailColumns = [
  { key: "email", label: "Correo" },
  { key: "actions", label: "" },
];

const resultColumns = computed(() => {
  if (activeTab.value === "general") {
    return [
      { key: "title", label: "Juego" },
      { key: "avgHistoria", label: "Historia" },
      { key: "avgGrafica", label: "Gráfica" },
      { key: "avgMecanica", label: "Mecánica" },
      { key: "avgGeneral", label: "General" },
      { key: "voteCount", label: "Votos" },
    ];
  }
  return [
    { key: "title", label: "Juego" },
    { key: "criterionAvg", label: "Promedio" },
    { key: "voteCount", label: "Votos" },
  ];
});

const sortedRows = computed(() => {
  const key = activeTab.value;
  return resultRows.value
    .filter((r) => r.voteCount > 0 || key === "general")
    .map((r) => ({
      ...r,
      avgHistoria: r.averages.historia || "—",
      avgGrafica: r.averages.grafica || "—",
      avgMecanica: r.averages.mecanica || "—",
      avgGeneral: r.averages.general || "—",
      criterionAvg:
        key === "historia"
          ? r.averages.historia
          : key === "grafica"
            ? r.averages.grafica
            : key === "mecanica"
              ? r.averages.mecanica
              : r.overallAverage,
    }))
    .sort((a, b) => {
      if (key === "general") return b.overallAverage - a.overallAverage;
      const av = Number(a.criterionAvg) || 0;
      const bv = Number(b.criterionAvg) || 0;
      return bv - av;
    });
});

const presentationRows = computed(() => sortedRows.value);

function criterionValue(row: (typeof sortedRows.value)[0]) {
  if (activeTab.value === "historia") return row.averages.historia;
  if (activeTab.value === "grafica") return row.averages.grafica;
  if (activeTab.value === "mecanica") return row.averages.mecanica;
  return row.overallAverage;
}

const tabOrder = ["intro", "historia", "grafica", "mecanica", "general"];

function prevTab() {
  const idx = tabOrder.indexOf(activeTab.value);
  activeTab.value = tabOrder[Math.max(0, idx - 1)];
}

function nextTab() {
  const idx = tabOrder.indexOf(activeTab.value);
  activeTab.value = tabOrder[Math.min(tabOrder.length - 1, idx + 1)];
}

function enterPresentation() {
  presentationMode.value = true;
  nextTick(() => presentationRef.value?.focus());
}

async function loadAll() {
  loadingEmails.value = true;
  try {
    const [config, dash, emails, results] = await Promise.all([
      fetchConfig(),
      fetchDashboard(),
      fetchAllowedEmails(),
      fetchResults(),
    ]);
    status.value = config.status;
    statusDraft.value = config.status;
    introText.value = config.introText;
    introTextDraft.value = config.introText;
    lowVotesThresholdDraft.value = config.lowVotesThreshold;
    dashboard.value = dash;
    allowedEmails.value = emails.emails;
    resultRows.value = results.rows;
    summary.value = results.summary;
  } catch (e) {
    showError(e, "Error al cargar datos");
  } finally {
    loadingEmails.value = false;
  }
}

async function saveStatus() {
  if (
    !confirm(
      `¿Cambiar estado a «${FINAL_EVAL_STATUS_LABELS[statusDraft.value]}»?`
    )
  ) {
    return;
  }
  savingStatus.value = true;
  try {
    await setStatus({
      status: statusDraft.value,
      introText: introTextDraft.value,
      lowVotesThreshold: lowVotesThresholdDraft.value,
    });
    status.value = statusDraft.value;
    introText.value = introTextDraft.value;
    toast.add({ title: "Configuración guardada", color: "green" });
    await loadAll();
  } catch (e) {
    showError(e, "Error al guardar");
  } finally {
    savingStatus.value = false;
  }
}

async function saveIntroOnly() {
  try {
    await setStatus({
      status: statusDraft.value,
      introText: introTextDraft.value,
      lowVotesThreshold: lowVotesThresholdDraft.value,
    });
    introText.value = introTextDraft.value;
    toast.add({ title: "Texto guardado", color: "green" });
  } catch (e) {
    showError(e, "Error al guardar texto");
  }
}

async function submitAddEmail() {
  addingEmail.value = true;
  try {
    await addEmail(newEmail.value);
    toast.add({ title: "Correo agregado", color: "green" });
    showAddEmail.value = false;
    newEmail.value = "";
    await loadAll();
  } catch (e) {
    showError(e, "Error al agregar");
  } finally {
    addingEmail.value = false;
  }
}

async function runBulkImport() {
  bulkLoading.value = true;
  try {
    const res = await bulkImport(bulkText.value);
    toast.add({
      title: "Importación completada",
      description: `${res.added.length} agregados, ${res.duplicates.length} duplicados, ${res.invalid.length} inválidos`,
      color: "green",
    });
    bulkText.value = "";
    await loadAll();
  } catch (e) {
    showError(e, "Error en importación");
  } finally {
    bulkLoading.value = false;
  }
}

async function removeEmailRow(row: { id: string; email: string }) {
  if (!confirm(`¿Eliminar ${row.email}?`)) return;
  try {
    await removeEmail(row.id);
    toast.add({ title: "Correo eliminado", color: "green" });
    await loadAll();
  } catch (e) {
    showError(e, "Error al eliminar");
  }
}

function exportCsv() {
  const rows = sortedRows.value;
  const key = activeTab.value;
  let header: string;
  let lines: string[];

  if (key === "general") {
    header = "Juego,Historia,Gráfica,Mecánica,General,Votos";
    lines = rows.map(
      (r) =>
        `"${r.title}",${r.averages.historia},${r.averages.grafica},${r.averages.mecanica},${r.averages.general},${r.voteCount}`
    );
  } else if (key === "intro") {
    return;
  } else {
    header = "Juego,Promedio,Votos";
    lines = rows.map(
      (r) => `"${r.title}",${criterionValue(r)},${r.voteCount}`
    );
  }

  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evaluacion-final-${key}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  loadAll();
  const onKey = (e: KeyboardEvent) => {
    if (!presentationMode.value) return;
    if (e.key === "Escape") presentationMode.value = false;
    if (e.key === "ArrowLeft") prevTab();
    if (e.key === "ArrowRight") nextTab();
  };
  window.addEventListener("keydown", onKey);
  onUnmounted(() => window.removeEventListener("keydown", onKey));
});
</script>
