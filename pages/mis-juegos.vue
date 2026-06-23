<template>
  <div class="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
    <div class="mb-6 md:mb-8 flex flex-wrap justify-between items-start gap-4">
      <div>
        <h1 class="text-3xl font-bold mb-2 tracking-tight">Mi juego</h1>
        <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Edita la ficha de tu proyecto, la portada, las instrucciones y enlaza tu
          juego desde GitHub Pages. Titular y compañero pueden editar la ficha; solo el
          titular invita o quita compañero.
        </p>
      </div>
      <UButton
        v-if="isLoggedIn"
        color="primary"
        variant="soft"
        :loading="isLoading"
        @click="refreshUserData"
      >
        <template #leading>
          <UIcon name="i-heroicons-arrow-path" />
        </template>
        Actualizar
      </UButton>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <div v-else-if="!isLoggedIn" class="text-center py-16">
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Acceso restringido</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Inicia sesión para gestionar tu juego.
      </p>
      <UButton to="/ingresar" color="primary" size="lg">Iniciar sesión</UButton>
    </div>

    <div v-else-if="!hasGameAccess" class="text-center py-16">
      <UIcon
        name="i-heroicons-puzzle-piece"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Aún no tienes temática asignada</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Reserva una temática o espera a que el titular te agregue como compañero.
      </p>
      <UButton to="/tematicas" color="primary" size="lg">
        Ver temáticas
      </UButton>
    </div>

    <template v-else-if="themeDetails && gameDetails">
      <UCard :ui="cardUi" class="mb-5 md:mb-6 overflow-hidden shadow-sm border border-gray-200/80 dark:border-gray-800/90">
        <template #header>
          <div class="bg-primary/10 p-5 md:p-6 flex items-start gap-4">
            <div
              class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-md border-2 border-white dark:border-gray-800 shrink-0"
            >
              {{ getThemeNumber(themeDetails) }}
            </div>
            <div class="min-w-0">
              <h2 class="text-xl md:text-2xl font-bold leading-tight">{{ themeDetails.title }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Leyenda base · Reservada el {{ formatDate(reservationDate) }}
              </p>
              <UBadge v-if="isTeammateOnly" color="amber" variant="subtle" class="mt-2">
                Eres compañero/a de equipo
              </UBadge>
            </div>
          </div>
        </template>
        <div class="p-5 md:p-6 prose dark:prose-invert max-w-none">
          <p class="text-gray-700 dark:text-gray-300">
            {{ themeDetails.description }}
          </p>
        </div>
      </UCard>

      <!-- Ficha editable -->
      <UCard
        v-if="canEdit"
        :ui="cardUi"
        class="mb-5 md:mb-6 border border-gray-200/80 dark:border-gray-800/90"
      >
        <template #header>
          <div class="px-5 py-4 md:px-6">
            <h3 class="text-xl font-semibold">Ficha pública del juego</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Completa la ficha del proyecto. Los campos con * son obligatorios para publicar.
            </p>
          </div>
        </template>
        <div class="p-5 md:p-6 space-y-6">
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30 p-4 space-y-4">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
              <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Identidad del juego
              </h4>
            </div>
            <UFormGroup
              label="Nombre del juego"
              description="Este nombre se verá en el listado público y en tu ficha."
              required
            >
              <UInput
                v-model="ficha.gameTitle"
                maxlength="120"
                placeholder="Ej: El Nahual"
                class="w-full"
              />
            </UFormGroup>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30 p-4 space-y-4">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
              <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Contenido de la ficha
              </h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup
                label="Resumen corto"
                description="Explica de forma breve de qué trata el juego (2-4 líneas)."
                required
              >
                <UTextarea
                  v-model="ficha.description"
                  :rows="5"
                  maxlength="600"
                  placeholder="Ej: Un chamán debe ocultar su identidad mientras escapa de cazadores..."
                  class="w-full"
                />
              </UFormGroup>
              <UFormGroup
                label="Cómo jugar"
                description="Indica controles, objetivo y condición de victoria/derrota."
                required
              >
                <UTextarea
                  v-model="ficha.instructions"
                  :rows="5"
                  placeholder="Ej: WASD para moverse, Shift para sigilo, E para interactuar..."
                  class="w-full"
                />
              </UFormGroup>
            </div>
            <UFormGroup
              label="Descripción extendida (opcional)"
              description="Puedes agregar historia, decisiones de diseño o créditos."
            >
              <UTextarea
                v-model="ficha.longDescription"
                :rows="4"
                placeholder="Opcional: contexto narrativo, inspiración, equipo..."
                class="w-full"
              />
            </UFormGroup>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30 p-4 space-y-4">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
              <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Repositorio del proyecto
              </h4>
            </div>
            <UFormGroup
              label="Repositorio en GitHub"
              description="URL del repositorio con el código fuente del proyecto (Unity, assets, etc.). No es la URL del juego en GitHub Pages; esa va en la sección «Juego en GitHub Pages»."
              required
            >
              <UInput
                v-model="ficha.repositoryUrl"
                type="url"
                placeholder="https://github.com/usuario/mi-proyecto-unity"
                class="w-full"
              />
            </UFormGroup>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30 p-4 space-y-4">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-400/30 text-gray-600 dark:text-gray-300 text-xs font-bold">4</span>
              <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Enlace opcional
              </h4>
            </div>
            <UFormGroup
              label="Página en itch.io"
              description="Opcional. Solo aparece como enlace en la ficha pública; el juego jugable en GameCraft se sirve desde GitHub Pages."
            >
              <UInput
                v-model="itchAnnexUrl"
                type="url"
                placeholder="https://usuario.itch.io/mi-juego"
                :disabled="!canEdit"
                class="w-full"
              />
            </UFormGroup>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Consejo: guarda primero la ficha y luego revisa la vista previa.
            </p>
            <div class="flex flex-wrap items-center gap-2">
            <UButton
              color="primary"
              :loading="savingFicha"
              :disabled="!ficha.gameTitle?.trim() || !ficha.description?.trim() || !ficha.repositoryUrl?.trim()"
              @click="saveFicha"
            >
              Guardar ficha
            </UButton>
            <UButton variant="soft" color="gray" :to="previewPath" target="_blank">
              Vista previa de la ficha
            </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Portada -->
      <UCard
        v-if="canEdit"
        :ui="cardUi"
        class="mb-5 md:mb-6 border border-gray-200/80 dark:border-gray-800/90"
      >
        <template #header>
          <div class="px-5 py-4 md:px-6">
            <h3 class="text-xl font-semibold">Imagen representativa</h3>
          </div>
        </template>
        <div class="p-5 md:p-6 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Captura o arte 16:9; evita texto ilegible en miniatura. Se usa en el
            listado de juegos y en la cabecera de la ficha.
          </p>
          <div
            v-if="gameDetails.gameImage"
            class="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 max-h-64 w-full max-w-xl"
          >
            <img
              :src="gameDetails.gameImage"
              alt="Portada"
              class="w-full h-full object-cover"
            />
          </div>
          <input
            ref="coverInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="onCoverSelected"
          />
          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              variant="soft"
              :loading="uploadingCover"
              @click="coverInput?.click()"
            >
              {{ gameDetails.gameImage ? "Cambiar imagen" : "Subir imagen" }}
            </UButton>
            <UButton
              v-if="gameDetails.gameImage"
              color="red"
              variant="ghost"
              :loading="removingCover"
              @click="removeCover"
            >
              Quitar imagen
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Juego en GitHub Pages (obligatorio para publicar) -->
      <UCard :ui="cardUi" class="mb-5 md:mb-6 border border-gray-200/80 dark:border-gray-800/90">
        <template #header>
          <div class="px-5 py-4 md:px-6 flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-xl font-semibold">Juego en GitHub Pages</h3>
            <UBadge color="amber" variant="soft">Obligatorio para publicar</UBadge>
          </div>
        </template>
        <div class="p-5 md:p-6 space-y-5">
          <div class="rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p class="font-medium text-gray-900 dark:text-gray-100">
              Pasos para publicar tu build WebGL
            </p>
            <ol class="space-y-2 list-decimal list-inside text-xs md:text-sm">
              <li>
                Exporta desde Unity como <strong>WebGL</strong>. En
                <strong>Player → WebGL → Publishing Settings</strong>, usa
                <strong>Compression Format → Disabled</strong> (GitHub Pages no
                soporta archivos <code>.br</code> de Brotli).
              </li>
              <li>
                Copia el build (con <code>index.html</code> en la raíz) en la carpeta
                <code>exportacionjuego/</code> de tu repositorio en GitHub.
              </li>
              <li>
                Descarga el workflow de ejemplo y colócalo en
                <code>.github/workflows/deploy-exportacionjuego-pages.yml</code>
                (crea las carpetas si no existen).
                <UButton
                  tag="a"
                  href="/ejemplos/deploy-exportacionjuego-pages.yml"
                  download="deploy-exportacionjuego-pages.yml"
                  color="gray"
                  variant="soft"
                  size="xs"
                  class="mt-2"
                  icon="i-heroicons-arrow-down-tray"
                >
                  Descargar workflow de ejemplo
                </UButton>
              </li>
              <li>
                Haz push a <code>main</code>. El workflow publica la carpeta
                <code>exportacionjuego/</code> en GitHub Pages.
              </li>
              <li>
                En GitHub del repo: <strong>Settings → Pages → GitHub Actions</strong>.
              </li>
              <li>
                Abre la URL publicada en el navegador y comprueba que el juego carga.
                Luego pégala abajo y usa <strong>Probar enlace</strong>.
              </li>
            </ol>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              URL de ejemplo:
              <code>https://usuario.github.io/minijuegos-WEB/exportacionjuego/</code>
            </p>
          </div>

          <UFormGroup
            label="URL del juego en GitHub Pages"
            description="Dirección donde GitHub Pages sirve tu index.html. Obligatoria para publicar en GameCraft."
            required
          >
            <UInput
              v-model="ghPagesInputUrl"
              type="url"
              placeholder="https://usuario.github.io/minijuegos-WEB/exportacionjuego/"
              :disabled="!canEdit"
              class="w-full"
            />
          </UFormGroup>

          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              variant="soft"
              :loading="isResolvingPlay"
              :disabled="!canEdit || !ghPagesInputUrl.trim()"
              @click="onTestPlayLink"
            >
              Probar enlace
            </UButton>
            <UButton
              color="primary"
              :loading="isSavingPlay"
              :disabled="!canEdit || !canSavePlay"
              @click="onSavePlayLink"
            >
              Guardar juego en GameCraft
            </UButton>
            <UButton
              v-if="gameDetails?.gameWebGLUrl"
              color="red"
              variant="ghost"
              :loading="clearingPlay"
              :disabled="!canEdit"
              @click="onClearPlayLink"
            >
              Quitar juego
            </UButton>
          </div>

          <p v-if="playImportError" class="text-sm text-red-600 dark:text-red-400">
            {{ playImportError }}
          </p>

          <p v-if="!canSavePlay && previewPlayUrl" class="text-xs text-amber-600 dark:text-amber-400">
            Espera a que la vista previa cargue correctamente antes de guardar.
          </p>

          <div
            v-if="previewPlayUrl"
            class="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="font-medium">Vista previa del juego</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="previewLoadState === 'loading'">Cargando…</span>
                  <span v-else-if="previewLoadState === 'loaded'" class="text-green-600 dark:text-green-400">
                    Carga correcta
                  </span>
                  <span v-else-if="previewLoadState === 'error'" class="text-red-600 dark:text-red-400">
                    Error al cargar el juego
                  </span>
                </p>
              </div>
              <UButton
                v-if="previewPlayUrl"
                :href="previewPlayUrl"
                target="_blank"
                variant="ghost"
                size="sm"
                icon="i-heroicons-arrow-top-right-on-square"
              >
                Abrir en GitHub Pages
              </UButton>
            </div>
            <GameIframe
              :src="previewPlayUrl"
              :canvas-width="previewCanvasWidth"
              :canvas-height="previewCanvasHeight"
              :frame-extra-height="previewFrameExtraHeight"
              :max-height-vh="70"
              title="Vista previa del juego"
              :iframe-key="previewPlayUrl"
              @load="onPreviewIframeLoad"
              @error="onPreviewIframeError"
            />
          </div>

          <div
            v-else-if="savedGamePlayUrl"
            class="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <p class="font-medium">Juego guardado en GameCraft</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Usa «Probar enlace» si actualizaste el build en GitHub Pages.
              </p>
            </div>
            <GameIframe
              :src="savedGamePlayUrl"
              :canvas-width="gameDetails?.gameCanvasWidth"
              :canvas-height="gameDetails?.gameCanvasHeight"
              :frame-extra-height="gameDetails?.gameFrameExtraHeight"
              :max-height-vh="50"
              title="Juego guardado"
            />
          </div>
        </div>
      </UCard>

      <!-- Equipo -->
      <UCard :ui="cardUi" class="mb-5 md:mb-6 border border-gray-200/80 dark:border-gray-800/90">
        <template #header>
          <div class="px-5 py-4 md:px-6">
            <h3 class="text-xl font-semibold">Equipo</h3>
          </div>
        </template>
        <div class="p-5 md:p-6 space-y-4">
          <div class="space-y-2 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              <span class="text-gray-500 dark:text-gray-400">Titular</span>
              <span class="font-medium">{{ themeDetails.reservedBy || "—" }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-gray-500 dark:text-gray-400">Compañero/a</span>
              <span class="font-medium">{{
                gameDetails.teammateEmail
                  ? gameDetails.teammateName || gameDetails.teammateEmail
                  : "Sin compañero/a"
              }}</span>
            </div>
          </div>
          <template v-if="isOwner">
            <div
              v-if="gameDetails.teammateEmail"
              class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-800"
            >
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Puedes reemplazar a tu compañero quitándolo primero.
              </p>
              <UButton
                color="red"
                variant="soft"
                size="sm"
                :loading="teammateLoading"
                @click="onRemoveTeammate"
              >
                Quitar compañero
              </UButton>
            </div>
            <div v-else class="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Invita a una sola persona usando su correo registrado.
              </p>
              <div class="flex flex-col sm:flex-row gap-2">
                <UInput
                  v-model="teammateEmailInput"
                  type="email"
                  placeholder="correo@alumnos.santotomas.cl"
                  class="flex-1"
                />
                <UButton
                  color="primary"
                  :loading="teammateLoading"
                  :disabled="!teammateEmailInput.trim()"
                  @click="onAddTeammate"
                >
                  Invitar compañero
                </UButton>
              </div>
            </div>
          </template>
          <template v-else-if="isTeammateOnly">
            <p class="text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-800">
              Solo el titular puede invitar o quitar compañero. Puedes editar la ficha del juego.
            </p>
          </template>
        </div>
      </UCard>

      <!-- Estado y publicación -->
      <UCard :ui="cardUi" class="mb-5 md:mb-6 border border-gray-200/80 dark:border-gray-800/90">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-4 md:px-6">
            <h3 class="text-xl font-semibold">Estado y publicación</h3>
            <UBadge :color="statusColor" variant="subtle">
              {{ statusLabel }}
            </UBadge>
          </div>
        </template>
        <div class="p-5 md:p-6 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Al publicar, tu juego aparece para todos en
            <NuxtLink to="/juegos" class="text-primary underline">/juegos</NuxtLink
            >. Requisitos: resumen, instrucciones, imagen y build WebGL subidos.
          </p>
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Elige estado del juego
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label
                v-for="option in statusOptions"
                :key="option.value"
                class="rounded-lg border px-3 py-2 cursor-pointer transition-colors"
                :class="
                  selectedStatus === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-800 hover:border-primary/50'
                "
              >
                <div class="flex items-start gap-2">
                  <input
                    v-model="selectedStatus"
                    type="radio"
                    name="gameStatus"
                    :value="option.value"
                    class="mt-1"
                  />
                  <div>
                    <p class="text-sm font-medium">{{ option.label }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ option.help }}</p>
                  </div>
                </div>
              </label>
            </div>
            <div class="md:hidden">
              <label
                for="game-status-select"
                class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block"
              >
                Selector rápido (combo)
              </label>
              <select
                id="game-status-select"
                v-model="selectedStatus"
                class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              :loading="savingStatus"
              :disabled="selectedStatus === normalizedStatus"
              @click="applySelectedStatus"
            >
              Aplicar estado
            </UButton>
            <UBadge v-if="selectedStatus === normalizedStatus" color="gray" variant="subtle">
              Ya está en {{ statusLabel.toLowerCase() }}
            </UBadge>
          </div>
          <p v-if="publishHint" class="text-sm text-amber-600 dark:text-amber-400">
            {{ publishHint }}
          </p>
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useGames } from "~/composables/useGames";
import { useGithubPagesImport } from "~/composables/useGithubPagesImport";
import {
  isGithubPagesHost,
  isItchAnnexUrl,
  normalizeItchInputUrl,
  resolveGamePlayUrl,
} from "~/utils/gamePlayUrl";
import {
  GAME_STATUS,
  normalizeGameStatus,
  gameStatusLabel,
  gameStatusColor,
} from "~/composables/useGameStatus";

definePageMeta({
  title: "Mi juego",
  description: "Edita tu ficha, portada, instrucciones y enlace a GitHub Pages",
});

const isLoading = ref(true);
const gameDetails = ref(null);
const themeDetails = ref(null);
const reservationDate = ref(null);
const themeFirestoreId = ref(null);

const ficha = ref({
  gameTitle: "",
  description: "",
  longDescription: "",
  instructions: "",
  repositoryUrl: "",
});

const savingFicha = ref(false);
const savingStatus = ref(false);
const uploadingCover = ref(false);
const removingCover = ref(false);
const teammateEmailInput = ref("");
const teammateLoading = ref(false);
const clearingPlay = ref(false);
const coverInput = ref(null);

const ghPagesInputUrl = ref("");
const itchAnnexUrl = ref("");
const previewPlayUrl = ref(null);
const previewCanvasWidth = ref(null);
const previewCanvasHeight = ref(null);
const previewFrameExtraHeight = ref(null);
const previewLoadState = ref("idle");
const lastTestedPlayUrl = ref("");

const cardUi = {
  divide: "divide-y divide-gray-200 dark:divide-gray-800",
};

const {
  isResolving: isResolvingPlay,
  isSaving: isSavingPlay,
  error: playImportError,
  testPlayUrl,
  savePlayUrl,
  clearGamePlay,
} = useGithubPagesImport();

const {
  isAuthenticated: isLoggedIn,
  user,
  userData,
  waitForAuthInitialized,
} = useAuth();

const { updateGameFicha, addTeammate, removeTeammate } = useGames();
const toast = useToast();

const hasGameAccess = computed(
  () => !!(userData.value?.reservedTheme?.id || themeFirestoreId.value)
);

const isOwner = computed(() => {
  if (!user.value?.uid || !themeDetails.value) return false;
  return themeDetails.value.reservedById === user.value.uid;
});

const isTeammateOnly = computed(() => {
  if (!user.value?.uid || !themeDetails.value) return false;
  return (
    themeDetails.value.teammateUid === user.value.uid &&
    themeDetails.value.reservedById !== user.value.uid
  );
});

const canEdit = computed(() => {
  if (!user.value?.uid || !themeDetails.value) return false;
  return (
    themeDetails.value.reservedById === user.value.uid ||
    themeDetails.value.teammateUid === user.value.uid
  );
});

const previewPath = computed(() =>
  themeFirestoreId.value ? `/juegos/${themeFirestoreId.value}` : "/juegos"
);

const gamePlayUrl = computed(() =>
  resolveGamePlayUrl(gameDetails.value?.gameWebGLUrl)
);

const savedGamePlayUrl = computed(() =>
  previewPlayUrl.value ? null : gamePlayUrl.value
);

const canSavePlay = computed(
  () =>
    !!previewPlayUrl.value &&
    previewLoadState.value === "loaded" &&
    lastTestedPlayUrl.value.trim() === ghPagesInputUrl.value.trim()
);

const normalizedStatus = computed(() =>
  normalizeGameStatus(gameDetails.value?.gameStatus)
);

const statusLabel = computed(() => gameStatusLabel(gameDetails.value?.gameStatus));
const statusColor = computed(() => gameStatusColor(gameDetails.value?.gameStatus));
const selectedStatus = ref(GAME_STATUS.BORRADOR);

const statusOptions = [
  {
    value: GAME_STATUS.BORRADOR,
    label: "Borrador",
    help: "No se muestra al público.",
  },
  {
    value: GAME_STATUS.EN_DESARROLLO,
    label: "En desarrollo",
    help: "Visible solo para tu equipo.",
  },
  {
    value: GAME_STATUS.PUBLICADO,
    label: "Publicado",
    help: "Aparece en el listado público.",
  },
];

function publishRequirementsMet() {
  const g = gameDetails.value;
  if (!g) return false;
  const desc = (ficha.value.description || g.description || "").trim();
  const instr = (ficha.value.instructions || g.instructions || "").trim();
  const repo = (ficha.value.repositoryUrl || g.repositoryUrl || "").trim();
  return !!(
    (ficha.value.gameTitle || g.gameTitle || g.title || "").trim() &&
    desc &&
    instr &&
    repo &&
    g.gameImage &&
    g.gameWebGLUrl
  );
}

const publishHint = computed(() => {
  if (normalizedStatus.value === GAME_STATUS.PUBLICADO) return "";
  if (!publishRequirementsMet()) {
    return "Para publicar completa: nombre del juego, resumen, instrucciones, repositorio del proyecto en GitHub, imagen representativa y juego en GitHub Pages.";
  }
  return "";
});

function syncFichaFromDetails() {
  const g = gameDetails.value;
  const t = themeDetails.value;
  if (!g || !t) return;
  ficha.value = {
    gameTitle:
      (g.gameTitle || "").trim() || (t.title || "").trim() || "",
    description: (g.description ?? t.description ?? "").toString(),
    longDescription: (g.longDescription ?? "").toString(),
    instructions: (g.instructions ?? "").toString(),
    repositoryUrl: (g.repositoryUrl ?? "").toString(),
  };
  if (g.gameWebGLUrl && !ghPagesInputUrl.value) {
    try {
      const host = new URL(g.gameWebGLUrl).hostname;
      if (isGithubPagesHost(host)) {
        ghPagesInputUrl.value = g.gameWebGLUrl;
      }
    } catch {
      /* ignore */
    }
  }
  if (g.gameUrl && isItchAnnexUrl(g.gameUrl) && !itchAnnexUrl.value) {
    itchAnnexUrl.value = g.gameUrl;
  }
}

watch(
  () => gameDetails.value?.id,
  () => syncFichaFromDetails(),
  { immediate: true }
);

watch(
  () => normalizedStatus.value,
  (status) => {
    if (status) selectedStatus.value = status;
  },
  { immediate: true }
);

const formatDate = (date) => {
  if (!date) return "—";
  try {
    if (date?.seconds) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date.seconds * 1000));
    }
    if (date instanceof Date) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    }
    return "—";
  } catch {
    return "—";
  }
};

const getThemeNumber = (theme) => {
  if (!theme) return "—";
  if (theme.numero !== undefined) return theme.numero;
  const m = String(theme.id || "").match(/tema(\d+)/i);
  // Evita mostrar IDs largos de Firestore en la insignia.
  return m?.[1] || "—";
};

watch(
  () => ghPagesInputUrl.value,
  () => {
    previewPlayUrl.value = null;
    previewLoadState.value = "idle";
    lastTestedPlayUrl.value = "";
  }
);

function resetPreviewState() {
  previewPlayUrl.value = null;
  previewCanvasWidth.value = null;
  previewCanvasHeight.value = null;
  previewFrameExtraHeight.value = null;
  previewLoadState.value = "idle";
  lastTestedPlayUrl.value = "";
}

function onPreviewIframeLoad() {
  previewLoadState.value = "loaded";
}

function onPreviewIframeError() {
  previewLoadState.value = "error";
}

async function onTestPlayLink() {
  if (!themeFirestoreId.value || !ghPagesInputUrl.value.trim()) return;
  if (!canEdit.value) {
    toast.add({ title: "No tienes permiso para editar", color: "red" });
    return;
  }
  resetPreviewState();
  previewLoadState.value = "loading";
  try {
    const result = await testPlayUrl(
      themeFirestoreId.value,
      ghPagesInputUrl.value.trim()
    );
    previewPlayUrl.value = result.playUrl;
    previewCanvasWidth.value = result.canvasWidth ?? null;
    previewCanvasHeight.value = result.canvasHeight ?? null;
    previewFrameExtraHeight.value = result.frameExtraHeight ?? null;
    lastTestedPlayUrl.value = ghPagesInputUrl.value.trim();
    toast.add({ title: "Enlace válido — revisa la vista previa", color: "green" });
  } catch (e) {
    previewLoadState.value = "error";
    toast.add({
      title: "No se pudo probar el enlace",
      description: e?.message || "Verifica la URL de GitHub Pages",
      color: "red",
    });
  }
}

async function onSavePlayLink() {
  if (!themeFirestoreId.value || !canSavePlay.value) return;
  try {
    await savePlayUrl(
      themeFirestoreId.value,
      ghPagesInputUrl.value.trim()
    );
    await loadGameDetails(themeFirestoreId.value, true);
    resetPreviewState();
    toast.add({ title: "Juego guardado en GameCraft", color: "green" });
  } catch (e) {
    toast.add({
      title: "Error al guardar",
      description: e?.message || "Intenta de nuevo",
      color: "red",
    });
  }
}

async function onClearPlayLink() {
  if (!themeFirestoreId.value) return;
  if (!confirm("¿Quitar el juego de GitHub Pages en GameCraft? El enlace a itch.io en la ficha no se modifica.")) {
    return;
  }
  clearingPlay.value = true;
  try {
    await clearGamePlay(themeFirestoreId.value);
    ghPagesInputUrl.value = "";
    resetPreviewState();
    await loadGameDetails(themeFirestoreId.value, true);
    toast.add({ title: "Enlaces eliminados", color: "green" });
  } catch (e) {
    toast.add({
      title: "Error al quitar enlaces",
      description: e?.message,
      color: "red",
    });
  } finally {
    clearingPlay.value = false;
  }
}

async function saveFicha() {
  if (!themeFirestoreId.value) return;
  savingFicha.value = true;
  try {
    const itchRaw = itchAnnexUrl.value.trim();
    let itchNormalized = null;
    if (itchRaw) {
      itchNormalized = normalizeItchInputUrl(itchRaw);
      if (!itchNormalized) {
        throw new Error(
          "URL de itch.io inválida. Usa la página pública del juego (https://usuario.itch.io/mi-juego)."
        );
      }
    }

    const r = await updateGameFicha(themeFirestoreId.value, {
      gameTitle: ficha.value.gameTitle.trim(),
      description: ficha.value.description.trim(),
      longDescription: ficha.value.longDescription.trim(),
      instructions: ficha.value.instructions.trim(),
      repositoryUrl: ficha.value.repositoryUrl.trim() || undefined,
    });
    if (!r.success) throw new Error(r.error || "Error");

    const { $firestore } = useNuxtApp();
    await updateDoc(doc($firestore, "themes", themeFirestoreId.value), {
      gameUrl: itchNormalized ?? deleteField(),
      lastUpdated: serverTimestamp(),
    });

    await loadGameDetails(themeFirestoreId.value, true);
    toast.add({ title: "Ficha guardada", color: "green" });
  } catch (e) {
    toast.add({ title: e?.message || "Error al guardar", color: "red" });
  } finally {
    savingFicha.value = false;
  }
}

async function setStatus(status) {
  if (!themeFirestoreId.value) return;
  savingStatus.value = true;
  try {
    const payload = { gameStatus: status, lastUpdated: new Date() };
    if (status === GAME_STATUS.PUBLICADO) {
      payload.publishedAt = new Date();
    }
    const r = await updateGameFicha(themeFirestoreId.value, payload);
    if (!r.success) throw new Error(r.error || "Error");
    await loadGameDetails(themeFirestoreId.value, true);
    toast.add({ title: "Estado actualizado", color: "green" });
  } catch (e) {
    toast.add({ title: e?.message || "Error", color: "red" });
  } finally {
    savingStatus.value = false;
  }
}

async function publishGame() {
  if (!publishRequirementsMet()) {
    toast.add({
      title: "Faltan datos",
      description: publishHint.value,
      color: "amber",
    });
    return;
  }
  await setStatus(GAME_STATUS.PUBLICADO);
}

async function applySelectedStatus() {
  if (selectedStatus.value === GAME_STATUS.PUBLICADO) {
    await publishGame();
    return;
  }
  await setStatus(selectedStatus.value);
}

async function onAddTeammate() {
  if (!themeFirestoreId.value || !user.value?.uid) return;
  teammateLoading.value = true;
  try {
    const r = await addTeammate(
      themeFirestoreId.value,
      teammateEmailInput.value.trim(),
      user.value.uid
    );
    if (!r.success) throw new Error(r.error || "Error");
    teammateEmailInput.value = "";
    await loadUserTheme();
    toast.add({ title: "Compañero agregado", color: "green" });
  } catch (e) {
    toast.add({ title: e?.message || "Error", color: "red" });
  } finally {
    teammateLoading.value = false;
  }
}

async function onRemoveTeammate() {
  if (!themeFirestoreId.value || !user.value?.uid) return;
  teammateLoading.value = true;
  try {
    const r = await removeTeammate(themeFirestoreId.value, user.value.uid);
    if (!r.success) throw new Error(r.error || "Error");
    await loadUserTheme();
    toast.add({ title: "Compañero eliminado", color: "green" });
  } catch (e) {
    toast.add({ title: e?.message || "Error", color: "red" });
  } finally {
    teammateLoading.value = false;
  }
}

async function onCoverSelected(e) {
  const file = e.target.files?.[0];
  if (!file || !themeFirestoreId.value) return;
  const { $storage } = useNuxtApp();
  if (!$storage) {
    toast.add({ title: "Storage no disponible", color: "red" });
    return;
  }
  uploadingCover.value = true;
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const path = `games/${themeFirestoreId.value}/cover_${Date.now()}.${safeExt}`;
    const ref = storageRef($storage, path);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    const { $firestore } = useNuxtApp();
    await updateDoc(doc($firestore, "themes", themeFirestoreId.value), {
      gameImage: url,
      gameImagePath: path,
      lastUpdated: serverTimestamp(),
    });
    await loadGameDetails(themeFirestoreId.value, true);
    toast.add({ title: "Imagen actualizada", color: "green" });
  } catch (err) {
    console.error(err);
    toast.add({ title: "Error al subir imagen", color: "red" });
  } finally {
    uploadingCover.value = false;
    if (coverInput.value) coverInput.value.value = "";
  }
}

async function removeCover() {
  if (!themeFirestoreId.value) return;
  removingCover.value = true;
  try {
    const { $firestore, $storage } = useNuxtApp();
    const path = gameDetails.value?.gameImagePath;
    if ($storage && path) {
      try {
        await deleteObject(storageRef($storage, path));
      } catch {
        /* ignore */
      }
    }
    await updateDoc(doc($firestore, "themes", themeFirestoreId.value), {
      gameImage: null,
      gameImagePath: null,
      lastUpdated: serverTimestamp(),
    });
    await loadGameDetails(themeFirestoreId.value, true);
    toast.add({ title: "Imagen eliminada", color: "green" });
  } catch (e) {
    toast.add({ title: e?.message || "Error", color: "red" });
  } finally {
    removingCover.value = false;
  }
}

async function loadGameDetails(themeId, force = false) {
  try {
    const { $firestore } = useNuxtApp();
    const themeRef = doc($firestore, "themes", themeId);
    const themeDoc = await getDoc(themeRef);
    if (!themeDoc.exists()) return;
    const data = themeDoc.data();
    gameDetails.value = {
      id: themeId,
      gameTitle: data.gameTitle,
      description: data.description,
      longDescription: data.longDescription,
      instructions: data.instructions,
      gameUrl: data.gameUrl,
      repositoryUrl: data.repositoryUrl,
      gameStatus: normalizeGameStatus(data.gameStatus),
      gameWebGLUrl: data.gameWebGLUrl || null,
      gameCanvasWidth: data.gameCanvasWidth ?? null,
      gameCanvasHeight: data.gameCanvasHeight ?? null,
      gameFrameExtraHeight: data.gameFrameExtraHeight ?? null,
      itchGameId: data.itchGameId || null,
      gameLocalPath: data.gameLocalPath || null,
      gameFilesCount: data.gameFilesCount ?? null,
      gameUploadedAt: data.gameUploadedAt || null,
      gameImage: data.gameImage || null,
      gameImagePath: data.gameImagePath || null,
      teammateEmail: data.teammateEmail,
      teammateUid: data.teammateUid,
      teammateName: data.teammateName,
      reservedById: data.reservedById,
    };
    if (force) {
      /* reactive ok */
    }
    syncFichaFromDetails();
  } catch (e) {
    console.error(e);
  }
}

async function loadUserTheme() {
  if (!isLoggedIn.value || !user.value?.uid) {
    isLoading.value = false;
    return;
  }
  const { $firestore } = useNuxtApp();
  isLoading.value = true;
  try {
    let themeId = userData.value?.reservedTheme?.id || null;
    reservationDate.value = userData.value?.reservedTheme?.reservedAt || null;

    if (!themeId) {
      const q = query(
        collection($firestore, "themes"),
        where("teammateUid", "==", user.value.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        themeId = snap.docs[0].id;
        const d = snap.docs[0].data();
        reservationDate.value = d.reservedAt || null;
      }
    }

    if (!themeId) {
      themeFirestoreId.value = null;
      themeDetails.value = null;
      gameDetails.value = null;
      return;
    }

    themeFirestoreId.value = themeId;
    const themeRef = doc($firestore, "themes", themeId);
    const themeDoc = await getDoc(themeRef);
    if (themeDoc.exists()) {
      themeDetails.value = { ...themeDoc.data(), id: themeDoc.id };
      await loadGameDetails(themeId);
    }
  } catch (e) {
    console.error(e);
    toast.add({ title: "Error al cargar datos", color: "red" });
  } finally {
    isLoading.value = false;
  }
}

const refreshUserData = async () => {
  await loadUserTheme();
};

onMounted(async () => {
  await waitForAuthInitialized();
  if (isLoggedIn.value) await loadUserTheme();
  else isLoading.value = false;
});
</script>
