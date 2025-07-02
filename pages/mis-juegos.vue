<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-4">Mi Juego</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Información sobre tu temática reservada y estado de tu juego.
          </p>
        </div>

        <!-- Botón para refrescar -->
        <UButton
          v-if="isLoggedIn"
          @click="refreshUserData"
          color="primary"
          variant="soft"
          :loading="isLoading"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" />
          </template>
          Actualizar datos
        </UButton>
      </div>
    </div>

    <!-- Pantalla de carga -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <!-- Mensaje si el usuario no está autenticado -->
    <div v-else-if="!isLoggedIn" class="text-center py-16">
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Acceso restringido</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Debes iniciar sesión para acceder a esta sección y ver la información de
        tu juego.
      </p>
      <UButton to="/ingresar" color="primary" size="lg">
        Iniciar sesión
      </UButton>
    </div>

    <!-- Mensaje si el usuario no ha reservado ninguna temática -->
    <div v-else-if="!userHasTheme && !isUserTeammate" class="text-center py-16">
      <UIcon
        name="i-heroicons-puzzle-piece"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Aún no has reservado temática</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Para desarrollar tu juego, primero debes reservar una temática
        disponible. Las temáticas son la base creativa de tu proyecto.
      </p>

      <!-- Información de depuración -->
      <div
        class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-w-md mx-auto mb-8 text-left text-sm"
      >
        <p class="font-bold mb-2">Información de depuración:</p>
        <p>
          Estado de autenticación:
          {{ isLoggedIn ? "Autenticado" : "No autenticado" }}
        </p>
        <p>Email del usuario: {{ user?.email || "No disponible" }}</p>
        <p>
          Datos reservedTheme:
          {{
            user?.reservedTheme ? JSON.stringify(user.reservedTheme) : "null"
          }}
        </p>
        <p>Es compañero: {{ isUserTeammate ? "Sí" : "No" }}</p>
        <p class="mt-2 text-xs text-gray-500">
          Si acabas de reservar una temática, intenta recargar la página.
        </p>

        <div class="mt-4 text-center">
          <UButton
            @click="refreshUserData"
            color="primary"
            variant="soft"
            size="sm"
            :loading="isLoading"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" />
            </template>
            Refrescar datos
          </UButton>
        </div>
      </div>

      <UButton to="/tematicas" color="primary" size="lg">
        Ver temáticas disponibles
      </UButton>
    </div>

    <!-- Contenido cuando el usuario tiene una temática reservada -->
    <div v-else-if="themeDetails">
      <!-- Tarjeta de la temática -->
      <UCard class="mb-8 overflow-hidden border-0 shadow-lg">
        <template #header>
          <div class="relative bg-primary/10 rounded-t-lg p-6">
            <div class="flex items-center">
              <div
                class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md border-2 border-white dark:border-gray-800"
              >
                {{ getThemeNumber(themeDetails) }}
              </div>
              <div>
                <h2 class="text-2xl font-bold">{{ themeDetails.title }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Reservada el {{ formatDate(reservationDate) }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <div class="p-6">
          <div class="prose dark:prose-invert max-w-none">
            <h3 class="text-xl font-semibold mb-4">Descripción</h3>
            <p>{{ themeDetails.description }}</p>

            <!-- Etiquetas/categorías -->
            <div
              v-if="themeDetails.tags && themeDetails.tags.length > 0"
              class="mt-6"
            >
              <h3 class="text-xl font-semibold mb-4">Categorías</h3>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in themeDetails.tags"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                  class="text-sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Equipo de desarrollo -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Equipo de desarrollo</h3>
          </div>
        </template>

        <div class="p-6">
          <div class="space-y-6">
            <!-- Introducción -->
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Tu equipo de desarrollo puede tener hasta 2 integrantes. Puedes
              añadir un compañero proporcionando su correo electrónico.
            </p>

            <!-- Formulario de equipo -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Usuario principal -->
              <div class="bg-primary/5 rounded-lg p-4">
                <div class="flex items-center mb-4">
                  <UAvatar
                    :alt="user?.email || 'Usuario'"
                    size="lg"
                    class="mr-3"
                  />
                  <div>
                    <p class="font-semibold">Usuario principal</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ user?.email || "Correo no disponible" }}
                    </p>
                  </div>
                </div>
                <UBadge color="green" variant="subtle" class="font-medium">
                  Activo
                </UBadge>
              </div>

              <!-- Segundo usuario -->
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center mb-4">
                  <UAvatar
                    v-if="themeDetails.teammateEmail"
                    :alt="themeDetails.teammateEmail"
                    size="lg"
                    class="mr-3"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 mr-3"
                  >
                    <UIcon name="i-heroicons-user-plus" class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="font-semibold">Compañero de equipo</p>
                    <p
                      v-if="themeDetails.teammateEmail"
                      class="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {{
                        themeDetails.teammateName ||
                        (themeDetails.teammateEmail
                          ? themeDetails.teammateEmail.split("@")[0]
                          : "") ||
                        themeDetails.teammateEmail
                      }}
                    </p>
                    <p v-else class="text-sm text-gray-500 dark:text-gray-500">
                      Sin compañero asignado
                    </p>
                  </div>
                </div>

                <!-- Si no hay compañero, mostrar el formulario para agregar uno -->
                <div v-if="!themeDetails.teammateEmail" class="mt-3">
                  <div class="flex space-x-2">
                    <UInput
                      v-model="teammate"
                      type="email"
                      placeholder="Correo de tu compañero"
                      class="flex-grow"
                      :disabled="isSubmittingTeammate"
                    />
                    <UButton
                      color="primary"
                      icon="i-heroicons-user-plus"
                      :disabled="
                        !isValidEmail(teammate) || isSubmittingTeammate
                      "
                      @click="saveTeammate"
                      :loading="isSubmittingTeammate"
                    />
                  </div>

                  <div v-if="teammateError" class="text-red-500 text-sm mt-1">
                    {{ teammateError }}
                  </div>
                </div>

                <!-- Si hay compañero y el usuario es el principal, mostrar badge -->
                <div v-else-if="isUserPrincipal" class="mt-2">
                  <UBadge color="green" variant="subtle" class="font-medium">
                    Compañero asignado
                  </UBadge>
                </div>

                <!-- Si el usuario es compañero, mostrar mensaje -->
                <div v-else-if="isUserTeammate" class="mt-2">
                  <UBadge color="blue" variant="subtle" class="font-medium">
                    Compañero de equipo
                  </UBadge>
                  <p class="text-sm text-gray-500 mt-2">
                    Has sido asignado como compañero de equipo por
                    {{ themeDetails.reservedBy || "el usuario principal" }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div
              class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm"
            >
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-information-circle"
                  class="h-5 w-5 text-amber-500 mr-3 flex-shrink-0"
                />
                <div>
                  <p class="font-semibold mb-1">Importante</p>
                  <p class="text-gray-600 dark:text-gray-400">
                    Ambos integrantes deben estar registrados en la plataforma.
                    Tu compañero tendrá acceso de visualización a la información
                    del juego.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Información sobre el estado del juego -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Estado de mi juego</h3>
          </div>
        </template>

        <div class="p-6">
          <!-- Si no hay juego creado todavía -->
          <div v-if="!gameDetails" class="text-center py-8">
            <UIcon
              name="i-heroicons-plus-circle"
              class="h-16 w-16 mx-auto text-gray-400 mb-4"
            />
            <h4 class="text-lg font-semibold mb-2">
              No has registrado tu juego
            </h4>
            <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Con tu temática reservada, ya puedes empezar a desarrollar tu
              juego para el concurso.
            </p>
            <UButton color="primary" @click="initializeMyGame">
              <template #leading>
                <UIcon name="i-heroicons-plus" />
              </template>
              Iniciar mi juego
            </UButton>
          </div>

          <!-- Cuando ya existe un juego -->
          <div v-else class="space-y-6">
            <!-- Estado actual del juego -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold mb-3">Estado actual</h4>
              <div
                class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center mb-6"
              >
                <UBadge
                  :color="getStatusColor(gameDetails.gameStatus)"
                  size="lg"
                  variant="soft"
                  class="mr-4"
                >
                  {{ getStatusLabel(gameDetails.gameStatus) }}
                </UBadge>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Última actualización:
                  {{
                    formatDate(
                      gameDetails.lastUpdated || gameDetails.reservedAt
                    )
                  }}
                </div>
              </div>
            </div>

            <!-- Formulario para actualizar estado -->
            <UFormGroup label="Estado de desarrollo" class="mb-4">
              <USelect
                v-model="gameForm.gameStatus"
                :options="gameStatusOptions"
                placeholder="Selecciona el estado actual"
              />
            </UFormGroup>

            <UFormGroup label="URL del juego" class="mb-4">
              <UInput
                v-model="gameForm.gameUrl"
                placeholder="https://ejemplo.com/mi-juego"
              />
              <template #hint>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  Si tu juego está publicado en línea, ingresa aquí su URL
                </span>
              </template>
            </UFormGroup>

            <UFormGroup label="URL del repositorio" class="mb-4">
              <UInput
                v-model="gameForm.repositoryUrl"
                placeholder="https://github.com/usuario/repositorio"
              />
              <template #hint>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  URL del repositorio de código fuente (GitHub, GitLab, etc.)
                </span>
              </template>
            </UFormGroup>

            <!-- Nueva sección para subir fotos del juego -->
            <div
              class="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6"
            >
              <h4 class="text-lg font-semibold mb-4">Imagen del juego</h4>

              <!-- Mostrar imagen actual si existe -->
              <div v-if="gameDetails.gameImage" class="mb-4">
                <img
                  :src="gameDetails.gameImage"
                  alt="Imagen del juego"
                  class="w-full max-w-md h-48 object-cover rounded-lg mx-auto mb-2"
                />
                <div class="flex justify-center">
                  <UButton
                    color="red"
                    variant="soft"
                    size="sm"
                    @click="removeGameImage"
                    icon="i-heroicons-trash"
                    class="mt-2"
                  >
                    Eliminar imagen
                  </UButton>
                </div>
              </div>

              <!-- Subir nueva imagen -->
              <div v-else class="mb-6">
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  :class="{ 'border-primary': isDragging }"
                >
                  <div v-if="isUploading">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="animate-spin h-10 w-10 text-primary mx-auto mb-2"
                    />
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Subiendo imagen...
                    </p>
                    <p
                      class="text-xs text-gray-500 dark:text-gray-500 mt-1"
                      v-if="uploadProgress > 0"
                    >
                      {{ Math.round(uploadProgress) }}%
                    </p>
                  </div>
                  <div v-else-if="selectedFile">
                    <div class="flex items-center justify-center mb-2">
                      <UIcon
                        name="i-heroicons-check-circle"
                        class="h-10 w-10 text-green-500"
                      />
                    </div>
                    <p class="text-sm font-medium mb-1">
                      {{ selectedFile.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      {{ (selectedFile.size / 1024).toFixed(1) }} KB
                    </p>
                    <UButton
                      color="primary"
                      size="sm"
                      class="mt-3"
                      @click.stop="uploadFile"
                    >
                      Subir imagen
                    </UButton>
                    <UButton
                      color="gray"
                      variant="ghost"
                      size="sm"
                      class="mt-3 ml-2"
                      @click.stop="cancelFileSelection"
                    >
                      Cancelar
                    </UButton>
                  </div>
                  <div v-else>
                    <UIcon
                      name="i-heroicons-photo"
                      class="h-10 w-10 text-gray-400 mx-auto mb-2"
                    />
                    <p class="text-sm font-medium mb-1">
                      Arrastra y suelta una imagen aquí
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500 mb-3">
                      O haz clic para seleccionar un archivo (PNG, JPG o GIF,
                      máx. 2MB)
                    </p>
                    <UButton
                      color="primary"
                      variant="soft"
                      size="sm"
                      @click.stop="triggerFileInput"
                    >
                      Seleccionar imagen
                    </UButton>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  class="hidden"
                  accept="image/png,image/jpeg,image/gif"
                  @change="handleFileSelect"
                />
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Sube una captura de pantalla representativa de tu juego para
                  mostrarla en la galería.
                </p>
              </div>
            </div>

            <!-- Subida del juego WebGL -->
            <div
              class="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <h4 class="text-lg font-semibold mb-3">Archivos del Juego</h4>

              <!-- Mostrar juego subido -->
              <div v-if="gameDetails.gameWebGLUrl" class="mb-6">
                <div
                  class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <UIcon
                        name="i-heroicons-check-circle"
                        class="h-8 w-8 text-green-500 mr-3"
                      />
                      <div>
                        <p
                          class="font-medium text-green-800 dark:text-green-200"
                        >
                          Juego subido correctamente
                        </p>
                        <p class="text-sm text-green-600 dark:text-green-400">
                          Subido el {{ formatDate(gameDetails.gameUploadedAt) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <UButton
                        color="green"
                        variant="soft"
                        size="sm"
                        @click="playGame"
                        icon="i-heroicons-play"
                      >
                        Jugar
                      </UButton>
                      <UButton
                        color="red"
                        variant="soft"
                        size="sm"
                        @click="removeGameFiles"
                        icon="i-heroicons-trash"
                      >
                        Eliminar
                      </UButton>
                    </div>
                  </div>
                </div>

                <!-- Vista previa del juego en iframe -->
                <div
                  v-if="showGamePreview"
                  class="mt-4 border rounded-lg overflow-hidden"
                >
                  <div
                    class="bg-gray-100 dark:bg-gray-800 p-3 flex items-center justify-between"
                  >
                    <h5 class="font-medium">Vista previa del juego</h5>
                    <UButton
                      color="gray"
                      variant="ghost"
                      size="sm"
                      @click="showGamePreview = false"
                      icon="i-heroicons-x-mark"
                    >
                      Cerrar
                    </UButton>
                  </div>
                  <iframe
                    :src="gameDetails.gameWebGLUrl"
                    class="w-full h-96"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>

              <!-- Subir nuevo juego -->
              <div v-else class="mb-6">
                <div
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary dark:hover:border-primary transition-colors"
                  @dragover.prevent="isGameDragging = true"
                  @dragleave.prevent="isGameDragging = false"
                  @drop.prevent="handleGameFolderDrop"
                  :class="{ 'border-primary bg-primary/5': isGameDragging }"
                >
                  <div v-if="isUploadingGame">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="animate-spin h-12 w-12 text-primary mx-auto mb-4"
                    />
                    <p class="text-lg font-medium mb-2">Subiendo juego...</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {{ uploadedFilesCount }}/{{ totalFilesCount }} archivos
                      subidos
                    </p>
                    <div
                      class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2"
                    >
                      <div
                        class="bg-primary h-2 rounded-full transition-all duration-300"
                        :style="{ width: gameUploadProgress + '%' }"
                      ></div>
                    </div>
                    <p class="text-xs text-gray-500">
                      {{ Math.round(gameUploadProgress) }}%
                    </p>
                  </div>

                  <div
                    v-else-if="
                      selectedGameFiles && selectedGameFiles.length > 0
                    "
                  >
                    <UIcon
                      name="i-heroicons-folder"
                      class="h-12 w-12 text-primary mx-auto mb-4"
                    />
                    <p class="text-lg font-medium mb-2">
                      {{ selectedGameFiles.length }} archivos seleccionados
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Carpeta: {{ selectedGameFolderName }}
                    </p>
                    <div class="flex justify-center space-x-3">
                      <UButton
                        color="primary"
                        @click="uploadGameFiles"
                        icon="i-heroicons-cloud-arrow-up"
                      >
                        Subir juego
                      </UButton>
                      <UButton
                        color="gray"
                        variant="ghost"
                        @click="cancelGameSelection"
                        icon="i-heroicons-x-mark"
                      >
                        Cancelar
                      </UButton>
                    </div>
                  </div>

                  <div v-else>
                    <UIcon
                      name="i-heroicons-folder-plus"
                      class="h-12 w-12 text-gray-400 mx-auto mb-4"
                    />
                    <p class="text-lg font-medium mb-2">Sube tu juego WebGL</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Arrastra la carpeta de tu build de Unity aquí o selecciona
                      los archivos
                    </p>
                    <div class="flex justify-center space-x-3">
                      <UButton
                        color="primary"
                        @click="triggerGameFolderInput"
                        icon="i-heroicons-folder"
                      >
                        Seleccionar carpeta
                      </UButton>
                      <UButton
                        color="primary"
                        variant="soft"
                        @click="triggerGameFilesInput"
                        icon="i-heroicons-document-plus"
                      >
                        Seleccionar archivos
                      </UButton>
                    </div>
                  </div>
                </div>

                <!-- Inputs ocultos para selección de archivos -->
                <input
                  ref="gameFolderInput"
                  type="file"
                  class="hidden"
                  webkitdirectory
                  directory
                  multiple
                  @change="handleGameFolderSelect"
                />
                <input
                  ref="gameFilesInput"
                  type="file"
                  class="hidden"
                  multiple
                  @change="handleGameFilesSelect"
                />

                <p class="text-xs text-gray-500 dark:text-gray-500 mt-3">
                  Sube la carpeta completa de tu build WebGL de Unity. Se creará
                  una carpeta específica para tu juego.
                </p>
              </div>
            </div>

            <!-- Enlaces -->
            <div
              v-if="gameDetails.gameUrl || gameDetails.repositoryUrl"
              class="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6"
            >
              <h4 class="text-lg font-semibold mb-3">Enlaces</h4>
              <div class="space-y-3">
                <div v-if="gameDetails.gameUrl" class="flex items-center">
                  <UIcon name="i-heroicons-play" class="text-primary mr-2" />
                  <a
                    :href="gameDetails.gameUrl"
                    target="_blank"
                    class="text-primary hover:underline"
                  >
                    Jugar ahora
                    <UIcon
                      name="i-heroicons-arrow-top-right-on-square"
                      class="inline ml-1 w-4 h-4"
                    />
                  </a>
                </div>
                <div v-if="gameDetails.repositoryUrl" class="flex items-center">
                  <UIcon
                    name="i-heroicons-code-bracket"
                    class="text-primary mr-2"
                  />
                  <a
                    :href="gameDetails.repositoryUrl"
                    target="_blank"
                    class="text-primary hover:underline"
                  >
                    Ver código fuente
                    <UIcon
                      name="i-heroicons-arrow-top-right-on-square"
                      class="inline ml-1 w-4 h-4"
                    />
                  </a>
                </div>
              </div>
            </div>

            <!-- Botón para guardar cambios -->
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="isSubmitting"
                @click="updateMyGame"
              >
                Guardar cambios
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useGames } from "~/composables/useGames";
import { collection, query, getDocs, where } from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Metadatos para SEO
definePageMeta({
  title: "Mi Juego",
  description:
    "Gestiona tu juego y consulta la información de tu temática reservada",
});

// Estado
const isLoading = ref(true);
const isSubmitting = ref(false);
const userGame = ref(null);
const gameDetails = ref(null);
const themeDetails = ref(null);
const reservationDate = ref(null);
const teammate = ref("");

// Estado para la subida de archivos (imágenes)
const fileInput = ref(null);
const selectedFile = ref(null);
const isUploading = ref(false);
const isDragging = ref(false);
const uploadProgress = ref(0);

// Estado para la subida de juegos WebGL
const gameFolderInput = ref(null);
const gameFilesInput = ref(null);
const selectedGameFiles = ref([]);
const selectedGameFolderName = ref("");
const isUploadingGame = ref(false);
const isGameDragging = ref(false);
const gameUploadProgress = ref(0);
const uploadedFilesCount = ref(0);
const totalFilesCount = ref(0);
const showGamePreview = ref(false);

// Hooks para obtener estado de autenticación
const { isAuthenticated: isLoggedIn, user, waitForAuthInitialized } = useAuth();
const toast = useToast();
const { getGameById, updateGameStatus } = useGames();

// Formulario para actualizar estado del juego
const gameForm = ref({
  gameStatus: "not_started",
  gameUrl: "",
  repositoryUrl: "",
});

// Opciones de estado para el formulario
const gameStatusOptions = [
  { label: "No iniciado", value: "not_started" },
  { label: "En progreso", value: "in_progress" },
  { label: "Completado", value: "completed" },
];

// Determinar si el usuario tiene una temática reservada o es compañero en alguna
const userHasTheme = computed(() => {
  console.log("[MisJuegos] Verificando userHasTheme:", user.value);
  return user.value?.reservedTheme?.id ? true : false;
});

// Obtener color según estado
const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "green";
    case "in_progress":
      return "amber";
    case "not_started":
    default:
      return "gray";
  }
};

// Obtener etiqueta según estado
const getStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return "Completado";
    case "in_progress":
      return "En progreso";
    case "not_started":
    default:
      return "No iniciado";
  }
};

// Formatear fecha de reserva
const formatDate = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    // Si es timestamp de Firestore
    if (date && typeof date === "object" && date.seconds) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date.seconds * 1000));
    }

    // Si es un objeto Date
    if (date instanceof Date) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    // Si es string, intentar convertir
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    }

    return "Fecha no disponible";
  } catch (error) {
    console.error("[MisJuegos] Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

// Función para extraer el número de la temática del ID
const getThemeNumber = (theme) => {
  if (!theme || !theme.id) return "N";

  console.log(
    "[MisJuegos] ID original recibido:",
    theme.id,
    "tipo:",
    typeof theme.id
  );

  // Si el tema tiene un campo 'numero', usarlo directamente y con prioridad
  if (theme && theme.numero !== undefined) {
    console.log("[MisJuegos] Usando campo numero:", theme.numero);
    return theme.numero;
  }

  // Asegurar que estamos trabajando con string
  const idStr = String(theme.id);

  // Intentar extraer el número si el ID sigue un patrón como "tema1" o similar
  if (theme && theme.id) {
    const matches = theme.id.match(/tema(\d+)/i);
    if (matches && matches[1]) {
      console.log(
        "[MisJuegos] Número extraído del patrón 'tema#':",
        matches[1]
      );
      return matches[1];
    }
  }

  // No extraer números de IDs aleatorios como "KBK7tnKqxiIcqvkHr3vN"
  // ya que eso produciría números incorrectos (73 en lugar de 1)

  // Valor por defecto: Si no podemos determinar el número, devolvemos "1"
  console.log("[MisJuegos] Usando valor por defecto: 1");
  return "1";
};

// Cargar los datos del tema reservado por el usuario y el juego asociado
const loadUserTheme = async () => {
  console.log("[MisJuegos] Estado de autenticación:", isLoggedIn.value);
  console.log("[MisJuegos] Email del usuario:", user.value?.email);

  if (!isLoggedIn.value || !user.value?.email) {
    console.log("[MisJuegos] No hay usuario autenticado");
    isLoading.value = false;
    return;
  }

  try {
    const { $firestore } = useNuxtApp();
    isLoading.value = true;

    // Primer caso: Usuario con temática reservada como principal
    if (user.value?.reservedTheme?.id) {
      console.log(
        "[MisJuegos] Usuario tiene tema reservado como principal:",
        user.value.reservedTheme.id
      );
      const themeId = user.value.reservedTheme.id;
      reservationDate.value = user.value.reservedTheme.reservedAt;

      // Obtener los detalles de la temática desde Firestore
      const themeDocRef = doc($firestore, "themes", themeId);
      const themeDoc = await getDoc(themeDocRef);

      if (themeDoc.exists()) {
        themeDetails.value = {
          ...themeDoc.data(),
          id: themeDoc.id,
        };
        console.log(
          "[MisJuegos] Temática cargada como principal:",
          themeDetails.value.title
        );

        // Cargar información del juego asociado a esta temática
        await loadGameDetails(themeId);
        isLoading.value = false;
        return;
      } else {
        console.warn(
          "[MisJuegos] La temática no existe en Firestore:",
          themeId
        );
      }
    }

    console.log(
      "[MisJuegos] Verificando si el usuario es compañero en algún juego..."
    );

    // Segundo caso: Usuario como compañero de equipo
    // Buscar en Firestore si el usuario es compañero en alguna temática
    const themesCollection = collection($firestore, "themes");
    const q = query(
      themesCollection,
      where("teammateEmail", "==", user.value.email.toLowerCase())
    );

    console.log(
      "[MisJuegos] Consultando temas donde el usuario es compañero:",
      user.value.email
    );

    const querySnapshot = await getDocs(q);
    console.log("[MisJuegos] Resultados encontrados:", querySnapshot.size);

    if (!querySnapshot.empty) {
      // El usuario es compañero en un juego
      const themeDoc = querySnapshot.docs[0];
      const themeData = themeDoc.data();

      console.log("[MisJuegos] Usuario es compañero en el juego:", themeDoc.id);
      console.log("[MisJuegos] Datos del juego:", {
        title: themeData.title,
        reservedBy: themeData.reservedBy,
        teammateEmail: themeData.teammateEmail,
      });

      themeDetails.value = {
        ...themeData,
        id: themeDoc.id,
      };

      // Obtener fecha de reserva
      reservationDate.value = themeDetails.value.reservedAt || null;

      // Cargar información del juego asociado
      await loadGameDetails(themeDoc.id);

      console.log(
        "[MisJuegos] Datos de juego cargados como compañero:",
        gameDetails.value ? "Sí" : "No"
      );

      isLoading.value = false;
      return;
    }

    // Si llega aquí, el usuario no tiene juego ni como principal ni como compañero
    console.log(
      "[MisJuegos] Usuario no tiene juego asignado ni como principal ni como compañero"
    );
    themeDetails.value = null;
    gameDetails.value = null;
  } catch (error) {
    console.error("[MisJuegos] Error al cargar la temática:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al cargar tu información",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// Cargar datos del juego
const loadGameDetails = async (themeId) => {
  try {
    console.log("[MisJuegos] Cargando datos del juego con ID:", themeId);

    // Utilizamos getGameById del composable useGames
    const game = await getGameById(themeId);

    if (game) {
      gameDetails.value = game;
      console.log("[MisJuegos] Datos del juego cargados:", game);

      // Inicializar formulario con los datos existentes
      gameForm.value = {
        gameStatus: game.gameStatus || "not_started",
        gameUrl: game.gameUrl || "",
        repositoryUrl: game.repositoryUrl || "",
      };
    } else {
      console.log(
        "[MisJuegos] No se encontró información de juego, creando nuevo"
      );
      gameDetails.value = null;
    }
  } catch (error) {
    console.error("[MisJuegos] Error al cargar datos del juego:", error);
    toast.add({
      title: "Error",
      description: "No se pudo cargar la información de tu juego",
      color: "red",
    });
  }
};

// Inicializar un nuevo juego
const initializeMyGame = async () => {
  if (!themeDetails.value || !themeDetails.value.id) {
    toast.add({
      title: "Error",
      description: "No se puede iniciar el juego sin una temática reservada",
      color: "red",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await updateGameStatus(themeDetails.value.id, {
      gameStatus: "not_started",
      gameUrl: "",
      repositoryUrl: "",
    });

    if (!result.success) {
      throw new Error(result.error || "Error al inicializar juego");
    }

    // Recargar datos del juego
    await loadGameDetails(themeDetails.value.id);

    toast.add({
      title: "Juego inicializado",
      description: "Tu juego ha sido inicializado correctamente",
      color: "green",
    });
  } catch (error) {
    console.error("[MisJuegos] Error al inicializar juego:", error);
    toast.add({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "No se pudo inicializar el juego",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Actualizar estado del juego
const updateMyGame = async () => {
  if (!gameDetails.value || !gameDetails.value.id) {
    toast.add({
      title: "Error",
      description: "No se encontró información del juego",
      color: "red",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await updateGameStatus(gameDetails.value.id, {
      gameStatus: gameForm.value.gameStatus,
      gameUrl: gameForm.value.gameUrl,
      repositoryUrl: gameForm.value.repositoryUrl,
    });

    if (!result.success) {
      throw new Error(result.error || "Error al actualizar juego");
    }

    // Recargar datos del juego
    await loadGameDetails(gameDetails.value.id);

    toast.add({
      title: "Juego actualizado",
      description:
        "La información de tu juego ha sido actualizada correctamente",
      color: "green",
    });
  } catch (error) {
    console.error("[MisJuegos] Error al actualizar juego:", error);
    toast.add({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el juego",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Función para refrescar los datos del usuario directamente desde Firestore
const refreshUserData = async () => {
  if (!isLoggedIn.value || !user.value?.uid) {
    console.log("[MisJuegos] No se puede refrescar: usuario no autenticado");
    return;
  }

  isLoading.value = true;
  console.log("[MisJuegos] Refrescando datos del usuario desde Firestore...");

  try {
    const { $firestore } = useNuxtApp();
    const userDocRef = doc($firestore, "users", user.value.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("[MisJuegos] Datos actualizados desde Firestore:", userData);

      // Si encontramos datos de reservedTheme en Firestore, actualizar y cargar temática
      if (userData.reservedTheme && userData.reservedTheme.id) {
        console.log(
          "[MisJuegos] Se encontró temática reservada en Firestore:",
          userData.reservedTheme
        );

        // Actualizar datos locales
        user.value = {
          ...user.value,
          reservedTheme: userData.reservedTheme,
        };

        // Cargar los detalles de la temática
        await loadUserTheme();

        // Mostrar mensaje de éxito
        toast.add({
          title: "Datos actualizados",
          description:
            "La información de tu temática ha sido cargada correctamente",
          color: "green",
        });

        return true;
      } else {
        console.log(
          "[MisJuegos] No se encontró temática reservada en Firestore"
        );
        toast.add({
          title: "Sin temática",
          description: "No se encontró ninguna temática reservada a tu nombre",
          color: "amber",
        });
      }
    } else {
      console.error(
        "[MisJuegos] No se encontró documento de usuario en Firestore"
      );
      toast.add({
        title: "Error",
        description: "No se pudo encontrar tu información de usuario",
        color: "red",
      });
    }

    return false;
  } catch (error) {
    console.error("[MisJuegos] Error al refrescar datos:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al actualizar tus datos",
      color: "red",
    });
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Validar formato de correo electrónico
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Guardar compañero de equipo
const saveTeammate = async () => {
  if (!isValidEmail(teammate.value)) {
    toast.add({
      title: "Formato inválido",
      description: "Por favor ingresa un correo electrónico válido",
      color: "amber",
    });
    return;
  }

  // No permitir asignar al mismo usuario como su propio compañero
  if (teammate.value.toLowerCase() === user.value?.email.toLowerCase()) {
    teammateError.value =
      "No puedes asignarte a ti mismo como compañero de equipo";
    return;
  }

  isSubmittingTeammate.value = true;
  teammateError.value = null;

  try {
    const { $firestore } = useNuxtApp();

    // 1. Verificar que el usuario existe
    const usersCollection = collection($firestore, "users");
    const q = query(
      usersCollection,
      where("email", "==", teammate.value.toLowerCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      teammateError.value = "El usuario no está registrado en la plataforma";
      return;
    }

    // Obtener el ID del usuario compañero
    const teammateDoc = querySnapshot.docs[0];
    const teammateUid = teammateDoc.id;
    const teammateData = teammateDoc.data();

    // 2. Verificar que el usuario no tiene un juego asignado
    if (teammateData.reservedTheme && teammateData.reservedTheme.id) {
      teammateError.value = "Este usuario ya tiene un juego reservado";
      return;
    }

    // 3. Verificar que el usuario no es compañero en otro juego
    const themesCollection = collection($firestore, "themes");
    const teammateQuery = query(
      themesCollection,
      where("teammateUid", "==", teammateUid)
    );
    const teammateCheck = await getDocs(teammateQuery);

    if (!teammateCheck.empty) {
      teammateError.value = "Este usuario ya es compañero en otro juego";
      return;
    }

    // 4. Actualizar el documento de la temática para agregar el compañero
    const themeDocRef = doc($firestore, "themes", themeDetails.value.id);
    await updateDoc(themeDocRef, {
      teammateEmail: teammate.value.toLowerCase(),
      teammateUid: teammateUid,
      updatedAt: serverTimestamp(),
    });

    // 5. Actualizar el documento del usuario compañero para registrar su asignación
    const teammateUserRef = doc($firestore, "users", teammateUid);
    await updateDoc(teammateUserRef, {
      teammateForTheme: {
        id: themeDetails.value.id,
        title: themeDetails.value.title,
        principalEmail: user.value.email,
        assignedAt: serverTimestamp(),
      },
    });

    // Actualizar datos locales
    themeDetails.value = {
      ...themeDetails.value,
      teammateEmail: teammate.value.toLowerCase(),
      teammateUid: teammateUid,
    };

    toast.add({
      title: "Compañero agregado",
      description: `${teammate.value} ha sido añadido a tu equipo de desarrollo`,
      color: "green",
    });

    // Limpiar el formulario
    teammate.value = "";

    // Recargar datos para actualizar la UI
    await loadUserTheme();
  } catch (error) {
    console.error("[MisJuegos] Error al guardar compañero:", error);
    toast.add({
      title: "Error",
      description: "No se pudo guardar el compañero de equipo",
      color: "red",
    });
    teammateError.value = "Ocurrió un error. Inténtalo nuevamente más tarde.";
  } finally {
    isSubmittingTeammate.value = false;
  }
};

// Verificar si el usuario actual es propietario principal o compañero
const isUserPrincipal = computed(() => {
  // Si el usuario es el que reservó la temática
  return (
    user.value &&
    themeDetails.value &&
    user.value.email === themeDetails.value.reservedBy
  );
});

const isUserTeammate = computed(() => {
  // Si el usuario es el compañero de equipo
  return (
    user.value &&
    themeDetails.value &&
    themeDetails.value.teammateEmail === user.value.email
  );
});

// Agregar más estados
const isSubmittingTeammate = ref(false);
const teammateError = ref(null);

// Funciones para manejo de archivos
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const validateAndSetFile = (file) => {
  // Validar tipo de archivo
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validTypes.includes(file.type)) {
    toast.add({
      title: "Formato no válido",
      description: "Solo se permiten archivos PNG, JPG o GIF",
      color: "red",
    });
    return;
  }

  // Validar tamaño (2MB máximo)
  if (file.size > 2 * 1024 * 1024) {
    toast.add({
      title: "Archivo demasiado grande",
      description: "El tamaño máximo permitido es 2MB",
      color: "red",
    });
    return;
  }

  selectedFile.value = file;
};

const cancelFileSelection = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const uploadFile = async () => {
  if (!selectedFile.value || !gameDetails.value?.id) return;

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const { $firestore } = useNuxtApp();
    const storage = getStorage();

    // Crear una referencia única para la imagen
    const themeId = gameDetails.value.id;
    const timestamp = Date.now();
    const fileName = `games/${themeId}/image_${timestamp}.${selectedFile.value.name
      .split(".")
      .pop()}`;

    const storageReference = storageRef(storage, fileName);
    const uploadTask = uploadBytesResumable(
      storageReference,
      selectedFile.value
    );

    // Manejar eventos de progreso de carga
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploadProgress.value = progress;
        console.log(`[MisJuegos] Progreso de carga: ${progress}%`);
      },
      (error) => {
        console.error("[MisJuegos] Error al subir imagen:", error);
        toast.add({
          title: "Error",
          description: "No se pudo subir la imagen. Intenta nuevamente.",
          color: "red",
        });
        isUploading.value = false;
      },
      async () => {
        // Carga completada, obtener URL de descarga
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("[MisJuegos] Imagen subida, URL:", downloadURL);

        // Actualizar el documento en Firestore
        const themeRef = doc($firestore, "themes", themeId);
        await updateDoc(themeRef, {
          gameImage: downloadURL,
          gameImagePath: fileName, // Guardar ruta para poder eliminar después
          lastUpdated: serverTimestamp(),
        });

        // Actualizar UI
        gameDetails.value = {
          ...gameDetails.value,
          gameImage: downloadURL,
          gameImagePath: fileName,
        };

        toast.add({
          title: "Imagen subida",
          description: "La imagen de tu juego ha sido subida correctamente",
          color: "green",
        });

        // Limpiar estado
        selectedFile.value = null;
        isUploading.value = false;
      }
    );
  } catch (error) {
    console.error("[MisJuegos] Error al procesar la subida:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al procesar la imagen",
      color: "red",
    });
    isUploading.value = false;
  }
};

const removeGameImage = async () => {
  if (!gameDetails.value?.gameImage || !gameDetails.value?.id) return;

  try {
    const { $firestore } = useNuxtApp();
    const storage = getStorage();

    // Si tenemos la ruta de la imagen guardada, usarla para eliminar
    if (gameDetails.value.gameImagePath) {
      const imageRef = storageRef(storage, gameDetails.value.gameImagePath);
      await deleteObject(imageRef);
    }

    // Actualizar Firestore
    const themeRef = doc($firestore, "themes", gameDetails.value.id);
    await updateDoc(themeRef, {
      gameImage: null,
      gameImagePath: null,
      lastUpdated: serverTimestamp(),
    });

    // Actualizar UI
    gameDetails.value = {
      ...gameDetails.value,
      gameImage: null,
      gameImagePath: null,
    };

    toast.add({
      title: "Imagen eliminada",
      description: "La imagen ha sido eliminada correctamente",
      color: "green",
    });
  } catch (error) {
    console.error("[MisJuegos] Error al eliminar imagen:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar la imagen",
      color: "red",
    });
  }
};

// ========== FUNCIONES PARA SUBIDA DE JUEGOS WEBGL ==========

// Activar input para seleccionar carpeta
const triggerGameFolderInput = () => {
  if (gameFolderInput.value) {
    gameFolderInput.value.click();
  }
};

// Activar input para seleccionar archivos múltiples
const triggerGameFilesInput = () => {
  if (gameFilesInput.value) {
    gameFilesInput.value.click();
  }
};

// Manejar selección de carpeta
const handleGameFolderSelect = (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    selectedGameFiles.value = files;
    // Obtener nombre de la carpeta desde el primer archivo
    const firstFile = files[0];
    const pathParts = firstFile.webkitRelativePath.split("/");
    selectedGameFolderName.value = pathParts[0] || "Carpeta seleccionada";

    console.log(
      `[MisJuegos] Carpeta seleccionada: ${selectedGameFolderName.value}, ${files.length} archivos`
    );
  }
};

// Manejar selección de archivos múltiples
const handleGameFilesSelect = (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    selectedGameFiles.value = files;
    selectedGameFolderName.value = `${files.length} archivos seleccionados`;

    console.log(`[MisJuegos] Archivos seleccionados: ${files.length}`);
  }
};

// Manejar drop de carpeta
const handleGameFolderDrop = (event) => {
  isGameDragging.value = false;
  const items = event.dataTransfer.items;
  const files = [];

  // Procesar elementos arrastrados
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length > 0) {
    selectedGameFiles.value = files;
    selectedGameFolderName.value = "Archivos arrastrados";

    console.log(`[MisJuegos] Archivos arrastrados: ${files.length}`);
  }
};

// Cancelar selección de archivos del juego
const cancelGameSelection = () => {
  selectedGameFiles.value = [];
  selectedGameFolderName.value = "";
  if (gameFolderInput.value) {
    gameFolderInput.value.value = "";
  }
  if (gameFilesInput.value) {
    gameFilesInput.value.value = "";
  }
};

// Subir archivos del juego
const uploadGameFiles = async () => {
  if (!selectedGameFiles.value.length || !gameDetails.value?.id) {
    toast.add({
      title: "Error",
      description:
        "No hay archivos seleccionados o no se pudo identificar el juego",
      color: "red",
    });
    return;
  }

  isUploadingGame.value = true;
  gameUploadProgress.value = 0;
  uploadedFilesCount.value = 0;
  totalFilesCount.value = selectedGameFiles.value.length;

  try {
    const { $firestore } = useNuxtApp();
    const storage = getStorage();
    const themeId = gameDetails.value.id;
    const timestamp = Date.now();

    // Crear la estructura de carpetas en Storage: games/{themeId}/webgl/
    const gameBasePath = `games/${themeId}/webgl`;

    // Array para almacenar las promesas de subida
    const uploadPromises = [];
    const uploadedFiles = [];

    // Procesar cada archivo
    for (let i = 0; i < selectedGameFiles.value.length; i++) {
      const file = selectedGameFiles.value[i];

      // Determinar la ruta del archivo
      let filePath;
      if (file.webkitRelativePath) {
        // Si viene de una carpeta, mantener la estructura
        const relativePath = file.webkitRelativePath;
        const pathParts = relativePath.split("/");
        // Remover el primer elemento (nombre de la carpeta raíz) y usar el resto
        const cleanPath = pathParts.slice(1).join("/");
        filePath = `${gameBasePath}/${cleanPath}`;
      } else {
        // Si son archivos individuales, ponerlos en la raíz
        filePath = `${gameBasePath}/${file.name}`;
      }

      console.log(`[MisJuegos] Subiendo archivo: ${file.name} -> ${filePath}`);

      // Crear referencia de storage
      const storageReference = storageRef(storage, filePath);

      // Crear tarea de subida
      const uploadTask = uploadBytesResumable(storageReference, file);

      // Crear promesa para la subida
      const uploadPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Actualizar progreso general
            const fileProgress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // El progreso general es el promedio de todos los archivos
            const totalProgress =
              (uploadedFilesCount.value * 100 + fileProgress) /
              totalFilesCount.value;
            gameUploadProgress.value = totalProgress;
          },
          (error) => {
            console.error(`[MisJuegos] Error subiendo ${file.name}:`, error);
            reject(error);
          },
          async () => {
            // Subida completada
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            uploadedFilesCount.value++;

            uploadedFiles.push({
              name: file.name,
              path: filePath,
              url: downloadURL,
              size: file.size,
            });

            console.log(`[MisJuegos] Archivo subido: ${file.name}`);
            resolve({
              name: file.name,
              path: filePath,
              url: downloadURL,
            });
          }
        );
      });

      uploadPromises.push(uploadPromise);
    }

    // Esperar a que todos los archivos se suban
    await Promise.all(uploadPromises);

    // Buscar el archivo index.html para usarlo como URL principal del juego
    const indexFile = uploadedFiles.find(
      (file) =>
        file.name.toLowerCase() === "index.html" ||
        file.path.toLowerCase().includes("index.html")
    );

    const gameWebGLUrl = indexFile ? indexFile.url : uploadedFiles[0]?.url;

    // Actualizar el documento en Firestore
    const themeRef = doc($firestore, "themes", themeId);
    await updateDoc(themeRef, {
      gameWebGLUrl,
      gameWebGLPath: gameBasePath,
      gameFiles: uploadedFiles,
      gameUploadedAt: serverTimestamp(),
      gameStatus: "completed", // Cambiar automáticamente a publicado
      lastUpdated: serverTimestamp(),
    });

    // Actualizar UI
    gameDetails.value = {
      ...gameDetails.value,
      gameWebGLUrl,
      gameWebGLPath: gameBasePath,
      gameFiles: uploadedFiles,
      gameUploadedAt: new Date(),
      gameStatus: "completed", // Actualizar también en la UI
    };

    toast.add({
      title: "Juego subido correctamente",
      description: `Se subieron ${uploadedFiles.length} archivos correctamente. Estado cambiado a: Completado`,
      color: "green",
    });

    // Limpiar estado
    cancelGameSelection();
  } catch (error) {
    console.error("[MisJuegos] Error al subir el juego:", error);
    toast.add({
      title: "Error",
      description: "No se pudo subir el juego. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isUploadingGame.value = false;
    gameUploadProgress.value = 0;
    uploadedFilesCount.value = 0;
    totalFilesCount.value = 0;
  }
};

// Reproducir juego
const playGame = () => {
  if (gameDetails.value?.gameWebGLUrl) {
    showGamePreview.value = true;
  }
};

// Eliminar archivos del juego
const removeGameFiles = async () => {
  if (!gameDetails.value?.gameWebGLPath || !gameDetails.value?.id) return;

  try {
    const { $firestore } = useNuxtApp();
    const storage = getStorage();

    // Si tenemos la lista de archivos, eliminarlos uno por uno
    if (
      gameDetails.value.gameFiles &&
      Array.isArray(gameDetails.value.gameFiles)
    ) {
      const deletePromises = gameDetails.value.gameFiles.map((file) => {
        const fileRef = storageRef(storage, file.path);
        return deleteObject(fileRef).catch((error) => {
          console.warn(`[MisJuegos] No se pudo eliminar ${file.path}:`, error);
        });
      });

      await Promise.all(deletePromises);
    }

    // Actualizar Firestore
    const themeRef = doc($firestore, "themes", gameDetails.value.id);
    await updateDoc(themeRef, {
      gameWebGLUrl: null,
      gameWebGLPath: null,
      gameFiles: null,
      gameUploadedAt: null,
      gameStatus: "in_progress", // Regresar a en progreso cuando se elimina
      lastUpdated: serverTimestamp(),
    });

    // Actualizar UI
    gameDetails.value = {
      ...gameDetails.value,
      gameWebGLUrl: null,
      gameWebGLPath: null,
      gameFiles: null,
      gameUploadedAt: null,
      gameStatus: "in_progress", // Actualizar también en la UI
    };

    showGamePreview.value = false;

    toast.add({
      title: "Juego eliminado",
      description:
        "Los archivos del juego han sido eliminados correctamente. Estado cambiado a: En progreso",
      color: "green",
    });
  } catch (error) {
    console.error("[MisJuegos] Error al eliminar el juego:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar el juego",
      color: "red",
    });
  }
};

// Inicializar
onMounted(async () => {
  console.log("[MisJuegos] Montando componente Mi Juego");

  // Esperar a que se inicialice la autenticación
  await waitForAuthInitialized();

  // Si el usuario está autenticado
  if (isLoggedIn.value) {
    // Cargar tema (como principal o como compañero)
    await loadUserTheme();

    // Si después de intentar cargar, seguimos sin tener detalles del tema
    if (!themeDetails.value) {
      console.log(
        "[MisJuegos] No se encontró temática ni como principal ni como compañero"
      );

      // Verificar si hay datos en el documento del usuario
      if (user.value?.uid) {
        console.log(
          "[MisJuegos] Intentando refrescar datos desde Firestore..."
        );
        await refreshUserData();

        // Si después de refrescar seguimos sin tema, verificar si hay información de compañero
        if (!themeDetails.value && user.value?.teammateForTheme?.id) {
          console.log(
            "[MisJuegos] Usuario tiene información de compañero en su perfil:",
            user.value.teammateForTheme
          );

          // Cargar datos de la temática donde es compañero
          try {
            const { $firestore } = useNuxtApp();
            const themeId = user.value.teammateForTheme.id;
            const themeDocRef = doc($firestore, "themes", themeId);
            const themeDoc = await getDoc(themeDocRef);

            if (themeDoc.exists()) {
              themeDetails.value = {
                ...themeDoc.data(),
                id: themeDoc.id,
              };
              console.log(
                "[MisJuegos] Temática cargada desde teammateForTheme:",
                themeDetails.value.title
              );

              // Cargar información del juego asociado
              await loadGameDetails(themeId);
            }
          } catch (err) {
            console.error(
              "[MisJuegos] Error al cargar tema como compañero:",
              err
            );
          }
        }
      }
    }
  } else {
    isLoading.value = false;
  }

  // Añadir diagnóstico final
  console.log("[MisJuegos] Estado final:", {
    isLoggedIn: isLoggedIn.value,
    themeLoaded: !!themeDetails.value,
    gameLoaded: !!gameDetails.value,
    isUserPrincipal: isUserPrincipal.value,
    isUserTeammate: isUserTeammate.value,
  });
});
</script>
