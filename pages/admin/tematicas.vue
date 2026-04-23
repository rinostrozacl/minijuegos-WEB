<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Administración de Temáticas</h1>
      <UButton
        color="primary"
        @click="openNewThemeModal"
        icon="i-heroicons-plus"
      >
        Nueva temática
      </UButton>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UCard class="bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xl font-bold">{{ themes.length }}</div>
            <div class="text-sm text-gray-500">Total de temáticas</div>
          </div>
          <UIcon
            name="i-heroicons-tag"
            class="text-primary h-8 w-8 opacity-80"
          />
        </div>
      </UCard>

      <UCard class="bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xl font-bold">{{ availableThemesCount }}</div>
            <div class="text-sm text-gray-500">Temáticas disponibles</div>
          </div>
          <UIcon
            name="i-heroicons-check-badge"
            class="text-green-600 h-8 w-8 opacity-80"
          />
        </div>
      </UCard>

      <UCard class="bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xl font-bold">{{ reservedThemesCount }}</div>
            <div class="text-sm text-gray-500">Temáticas reservadas</div>
          </div>
          <UIcon
            name="i-heroicons-lock-closed"
            class="text-amber-600 h-8 w-8 opacity-80"
          />
        </div>
      </UCard>
    </div>

    <!-- Búsqueda y filtros -->
    <div class="mb-6 flex flex-col md:flex-row gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Buscar por título o ID..."
        icon="i-heroicons-magnifying-glass"
        class="flex-grow"
      />

      <USelectMenu
        v-model="filterStatus"
        placeholder="Estado"
        :options="statusOptions"
        class="w-full md:w-48"
      />

      <USelectMenu
        v-model="selectedCategory"
        placeholder="Categoría"
        :options="categoryOptions"
        class="w-full md:w-48"
      />
    </div>

    <!-- Tabla de temáticas totalmente simplificada -->
    <div
      class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow mb-6"
    >
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else-if="filteredThemes.length === 0" class="py-16 text-center">
        <div class="mx-auto h-12 w-12 mb-4 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <p class="text-lg text-gray-500">No se encontraron temáticas</p>
        <p class="text-sm text-gray-400 mt-2">
          {{
            searchQuery
              ? "Intenta con otra búsqueda"
              : "Aún no hay temáticas creadas"
          }}
        </p>
      </div>

      <table
        v-else
        class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
      >
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('id')"
            >
              #
              <span v-if="sortBy === 'id'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('title')"
            >
              Título
              <span v-if="sortBy === 'title'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('available')"
            >
              Estado
              <span v-if="sortBy === 'available'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Reserva
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <tr
            v-for="row in paginatedThemes"
            :key="row.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div
                class="w-8 h-8 rounded-full bg-primary-100 dark:bg-gray-600 flex items-center justify-center text-primary-600 dark:text-gray-200 font-semibold"
              >
                {{ getThemeNumber(row.id) }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ row.title }}
              </div>
              <div class="mt-1 flex flex-wrap gap-1">
                <span
                  v-for="tag in row.tags"
                  :key="tag"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="
                  row.available
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                "
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ row.available ? "Disponible" : "Reservada" }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="!row.available">
                <div class="flex flex-col gap-1 mb-1">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-heroicons-user"
                      class="text-primary w-4 h-4"
                    />
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ row.reservedBy || "No disponible" }}
                    </span>
                  </div>
                  <template v-if="row.teammateName || row.teammateEmail">
                    <div class="flex items-center gap-2">
                      <UIcon
                        name="i-heroicons-user"
                        class="text-primary w-4 h-4"
                      />
                      <span
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{
                          row.teammateName ||
                          (row.teammateEmail
                            ? row.teammateEmail.split("@")[0]
                            : "") ||
                          row.teammateEmail
                        }}
                      </span>
                    </div>
                  </template>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{
                    row.reservedAt
                      ? formatDate(row.reservedAt)
                      : "Fecha desconocida"
                  }}
                </div>
              </div>
              <span v-else class="text-sm text-gray-500 dark:text-gray-400"
                >-</span
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex space-x-2">
                <button
                  @click="editTheme(row)"
                  class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  title="Editar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                <button
                  v-if="!row.available"
                  @click="confirmRelease(row)"
                  class="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                  title="Liberar reserva"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <button
                  v-if="row.gameImage"
                  @click="openGameImage(row.gameImage)"
                  class="text-primary hover:text-blue-700 dark:text-primary dark:hover:text-blue-400"
                  title="Ver imagen del juego"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <button
                  @click="confirmDelete(row)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Eliminar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación simplificada -->
    <div
      class="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3"
    >
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando
        <span class="font-medium">{{
          filteredThemes.length > 0 ? (page - 1) * pageSize + 1 : 0
        }}</span>
        a
        <span class="font-medium">{{
          Math.min(page * pageSize, filteredThemes.length)
        }}</span>
        de
        <span class="font-medium">{{ filteredThemes.length }}</span>
        temáticas
      </div>

      <div class="flex space-x-2" v-if="filteredThemes.length > pageSize">
        <button
          @click="page = Math.max(1, page - 1)"
          :disabled="page === 1"
          :class="
            page === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          "
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
        >
          Anterior
        </button>

        <button
          v-for="p in Math.min(5, Math.ceil(filteredThemes.length / pageSize))"
          :key="p"
          @click="page = p"
          :class="
            page === p
              ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          "
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium"
        >
          {{ p }}
        </button>

        <button
          @click="
            page = Math.min(
              Math.ceil(filteredThemes.length / pageSize),
              page + 1
            )
          "
          :disabled="page >= Math.ceil(filteredThemes.length / pageSize)"
          :class="
            page >= Math.ceil(filteredThemes.length / pageSize)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          "
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de creación/edición de temáticas -->
    <Teleport to="body">
      <div
        v-if="showThemeModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showThemeModal = false"
        ></div>

        <!-- Modal content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-xl"
          >
            <!-- Header -->
            <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold">
                  {{ isEditing ? "Editar temática" : "Nueva temática" }}
                </h3>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="showThemeModal = false"
                >
                  <span class="sr-only">Cerrar</span>
                  <svg
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Contenido del formulario -->
              <div class="space-y-4 mt-4">
                <div class="mb-4">
                  <label
                    class="block text-sm font-medium mb-1"
                    :class="{ 'text-red-500': errorTitle }"
                    >Título <span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    v-model="themeForm.title"
                    placeholder="Título de la temática"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errorTitle }"
                  />
                  <p v-if="errorTitle" class="text-red-500 text-xs mt-1">
                    El título es obligatorio
                  </p>
                </div>

                <div class="mb-4">
                  <label
                    class="block text-sm font-medium mb-1"
                    :class="{ 'text-red-500': errorDescription }"
                    >Descripción <span class="text-red-500">*</span></label
                  >
                  <textarea
                    v-model="themeForm.description"
                    placeholder="Describe la temática"
                    rows="4"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errorDescription }"
                  ></textarea>
                  <p v-if="errorDescription" class="text-red-500 text-xs mt-1">
                    La descripción es obligatoria
                  </p>
                </div>

                <div class="mb-4">
                  <label
                    class="block text-sm font-medium mb-1"
                    :class="{ 'text-red-500': errorTags }"
                    >Etiquetas <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="themeForm.tags"
                    multiple
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errorTags }"
                  >
                    <option
                      v-for="opt in categoryOptionsAll"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    Seleccione al menos una categoría
                  </p>
                  <p v-if="errorTags" class="text-red-500 text-xs mt-1">
                    Debe seleccionar al menos una etiqueta
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Estado</label>
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      v-model="themeForm.available"
                      class="rounded text-primary focus:ring-primary"
                    />
                    <span>{{
                      themeForm.available ? "Disponible" : "Reservada"
                    }}</span>
                  </div>
                </div>

                <div v-if="!themeForm.available" class="space-y-4">
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-1"
                      >Reservada por</label
                    >
                    <input
                      type="text"
                      v-model="themeForm.reservedBy"
                      placeholder="Nombre del estudiante"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-1"
                      >Fecha de reserva</label
                    >
                    <input
                      type="date"
                      v-model="themeForm.reservedAt"
                      placeholder="Fecha de reserva"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer con botones -->
            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            >
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:ml-3 sm:w-auto"
                :disabled="!isFormValid || isSubmitting"
                @click="saveTheme"
              >
                <svg
                  v-if="isSubmitting"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isEditing ? "Actualizar" : "Crear" }}
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                @click="showThemeModal = false"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmación para eliminar -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showDeleteModal = false"
        ></div>

        <!-- Modal content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
          >
            <!-- Header -->
            <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold text-red-600">
                  Eliminar temática
                </h3>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="showDeleteModal = false"
                >
                  <span class="sr-only">Cerrar</span>
                  <svg
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Contenido -->
              <div class="mt-4">
                <p>
                  ¿Estás seguro que deseas eliminar la temática
                  <strong>{{ selectedTheme?.title }}</strong
                  >?
                </p>
                <p class="text-sm text-red-500 mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <!-- Footer con botones -->
            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            >
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                :disabled="isSubmitting"
                @click="deleteTheme"
              >
                <svg
                  v-if="isSubmitting"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Eliminar
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                @click="showDeleteModal = false"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmación para liberar -->
    <Teleport to="body">
      <div
        v-if="showReleaseModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showReleaseModal = false"
        ></div>

        <!-- Modal content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
          >
            <!-- Header -->
            <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-semibold text-amber-600">
                  Liberar temática
                </h3>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="showReleaseModal = false"
                >
                  <span class="sr-only">Cerrar</span>
                  <svg
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Contenido -->
              <div class="mt-4">
                <p>
                  ¿Estás seguro que deseas liberar la temática
                  <strong>{{ selectedTheme?.title }}</strong
                  >?
                </p>
                <p class="text-sm mt-2">
                  Esta temática actualmente está reservada por
                  <strong>{{ selectedTheme?.reservedBy }}</strong
                  >. Al liberarla, volverá a estar disponible para ser
                  reservada.
                </p>
              </div>
            </div>

            <!-- Footer con botones -->
            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            >
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 sm:ml-3 sm:w-auto"
                :disabled="isSubmitting"
                @click="releaseTheme"
              >
                <svg
                  v-if="isSubmitting"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Liberar
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                @click="showReleaseModal = false"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

definePageMeta({
  middleware: ["admin"],
  layout: "admin",
});

// Estado
const themes = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const searchQuery = ref("");
const filterStatus = ref(null);
const selectedCategory = ref(null);
const showThemeModal = ref(false);
const showDeleteModal = ref(false);
const showReleaseModal = ref(false);
const isEditing = ref(false);
const selectedTheme = ref(null);

// Variables para ordenación y paginación
const sortBy = ref("id");
const sortDirection = ref("asc");
const page = ref(1);
const pageSize = ref(10);

// Variables para validación de formulario
const errorTitle = ref(false);
const errorDescription = ref(false);
const errorTags = ref(false);

// Opciones para filtros
const statusOptions = [
  { label: "Todas", value: null },
  { label: "Disponibles", value: "available" },
  { label: "Reservadas", value: "reserved" },
];

// Categorías para filtrado y selección
const categoryOptionsAll = [
  { label: "Mitología", value: "Mitología" },
  { label: "Grecia", value: "Grecia" },
  { label: "Nórdica", value: "Nórdica" },
  { label: "Egipto", value: "Egipto" },
  { label: "Maya", value: "Maya" },
  { label: "Japón", value: "Japón" },
  { label: "Sudamérica", value: "Sudamérica" },
  { label: "Polinesia", value: "Polinesia" },
  { label: "Azteca", value: "Azteca" },
  { label: "Eslava", value: "Eslava" },
  { label: "Británica", value: "Británica" },
  { label: "Latinoamérica", value: "Latinoamérica" },
  { label: "India", value: "India" },
  { label: "Nativo americano", value: "Nativo americano" },
  { label: "Inuit", value: "Inuit" },
  { label: "China", value: "China" },
  { label: "Celta", value: "Celta" },
  { label: "Europa medieval", value: "Europa medieval" },
  { label: "Mesoamérica", value: "Mesoamérica" },
];

// Opciones para el filtro de categoría
const categoryOptions = computed(() => {
  return [{ label: "Todas", value: null }, ...categoryOptionsAll];
});

// Formulario para crear/editar temáticas
const themeForm = ref({
  title: "",
  description: "",
  tags: [],
  available: true,
  reservedBy: "",
  reservedAt: "",
});

// Contadores
const availableThemesCount = computed(() => {
  return themes.value.filter((theme) => theme.available).length;
});

const reservedThemesCount = computed(() => {
  return themes.value.filter((theme) => !theme.available).length;
});

// Actualización de la validación del formulario
const isFormValid = computed(() => {
  // Reiniciar estado de errores
  errorTitle.value = themeForm.value.title.trim() === "";
  errorDescription.value = themeForm.value.description.trim() === "";
  errorTags.value = themeForm.value.tags.length === 0;

  return !errorTitle.value && !errorDescription.value && !errorTags.value;
});

// Manejar cambios en el ordenamiento
const updateSort = (sort) => {
  sortBy.value = sort.column;
  sortDirection.value = sort.direction;
};

// Manejar cambios de página
const updatePage = (newPage) => {
  page.value = newPage;
};

// Filtrado de temáticas con ordenamiento
const filteredThemes = computed(() => {
  let result = [...themes.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (theme) =>
        theme.title?.toLowerCase().includes(query) ||
        String(theme.id).toLowerCase().includes(query)
    );
  }

  // Filtrar por estado
  if (filterStatus.value === "available") {
    result = result.filter((theme) => theme.available === true);
  } else if (filterStatus.value === "reserved") {
    result = result.filter((theme) => theme.available === false);
  }

  // Filtrar por categoría
  if (selectedCategory.value) {
    result = result.filter(
      (theme) => theme.tags && theme.tags.includes(selectedCategory.value)
    );
  }

  // Ordenar por la columna seleccionada
  if (sortBy.value) {
    result.sort((a, b) => {
      let aValue = a[sortBy.value];
      let bValue = b[sortBy.value];

      // Manejar ordenamiento especial para el ID (extraer número)
      if (sortBy.value === "id") {
        aValue = parseInt(String(a.id).replace(/\D/g, "") || "0", 10);
        bValue = parseInt(String(b.id).replace(/\D/g, "") || "0", 10);
      }

      // Manejar valores indefinidos
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      // Comparar valores
      if (aValue < bValue) return sortDirection.value === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection.value === "asc" ? 1 : -1;
      return 0;
    });
  }

  return result;
});

// Temas paginados (para mostrar en la tabla)
const paginatedThemes = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredThemes.value.slice(start, end);
});

// Obtener el número de la temática desde el ID
const getThemeNumber = (theme) => {
  // Si recibimos un objeto
  if (theme && typeof theme === "object") {
    // Si tiene un campo 'numero', usarlo con prioridad
    if (theme.numero !== undefined) {
      return theme.numero;
    }

    // Buscar el campo 'id' interno (no el ID del documento)
    if (theme.id !== undefined && typeof theme.id === "string") {
      // Extraer solo los dígitos del ID interno
      const matches = theme.id.match(/\d+/);
      if (matches && matches[0]) {
        return matches[0];
      }
    }

    // Si llega aquí, usar el ID como string
    theme = theme.id || "";
  }

  // Para el caso de que se pase el ID directamente como string
  const idStr = String(theme || "");
  const match = idStr.match(/\d+/);
  return match ? match[0] : "N/A";
};

// Formatear fecha
const formatDate = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    // Verificar si es timestamp de Firestore
    if (date && typeof date === "object" && date.seconds) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date.seconds * 1000));
    }

    // Si es string, intentar convertir a fecha
    if (typeof date === "string") {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return new Intl.DateTimeFormat("es-CL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(dateObj);
      }
      return date;
    }

    // Si ya es un objeto Date
    if (date instanceof Date) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    return "Fecha no disponible";
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

// Acceso a Firebase
const { $firestore } = useNuxtApp();
const toast = useToast();

// Cargar temáticas desde Firestore
const loadThemes = async () => {
  try {
    console.log("[DEBUG] Iniciando carga de temáticas...");
    console.log("[DEBUG] Firestore disponible:", !!$firestore);
    isLoading.value = true;

    // Verificar si hay conexión a Firestore
    if (!$firestore) {
      console.error("[DEBUG] ERROR: Firestore no está disponible");
      toast.add({
        title: "Error de conexión",
        description:
          "No se pudo conectar a Firestore. Revisa la consola para más detalles.",
        color: "red",
      });
      return;
    }

    // Intentar una operación simple para verificar la conexión
    console.log("[DEBUG] Intentando acceder a la colección 'themes'...");
    const themesCollection = collection($firestore, "themes");
    console.log("[DEBUG] Colección obtenida:", !!themesCollection);

    console.log("[DEBUG] Obteniendo documentos...");
    const querySnapshot = await getDocs(themesCollection);
    console.log("[DEBUG] Query snapshot obtenido, tamaño:", querySnapshot.size);

    if (querySnapshot.empty) {
      console.log(
        "[DEBUG] No se encontraron documentos en la colección 'themes'"
      );
      themes.value = [];
      return;
    }

    const themesData = [];
    querySnapshot.forEach((doc) => {
      console.log("[DEBUG] Documento encontrado:", doc.id);
      const data = doc.data();
      console.log(
        "[DEBUG] Datos del documento:",
        JSON.stringify(data).substring(0, 100) + "..."
      );
      themesData.push({
        id: doc.id,
        ...data,
      });
    });

    console.log("[DEBUG] Total de documentos procesados:", themesData.length);
    themes.value = themesData;
    console.log("[DEBUG] Temáticas cargadas completo:", themes.value.length);
    console.log(
      "[DEBUG] Primera temática:",
      themes.value.length > 0
        ? JSON.stringify(themes.value[0]).substring(0, 100) + "..."
        : "No hay temáticas"
    );
    console.log(
      "[DEBUG] filteredThemes calculado:",
      filteredThemes.value.length
    );
  } catch (error) {
    console.error("[DEBUG] Error al cargar temáticas:", error);
    console.error("[DEBUG] Stack trace:", error.stack);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar las temáticas. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
    console.log(
      "[DEBUG] Estado de carga finalizado, isLoading:",
      isLoading.value
    );
  }
};

// Abrir modal para nueva temática
const openNewThemeModal = () => {
  isEditing.value = false;
  themeForm.value = {
    title: "",
    description: "",
    tags: [],
    available: true,
    reservedBy: "",
    reservedAt: "",
  };
  showThemeModal.value = true;
};

// Abrir modal para editar temática
const editTheme = (theme) => {
  isEditing.value = true;
  selectedTheme.value = theme;

  // Formatear fecha para el input type="date" si existe
  let formattedDate = "";
  if (theme.reservedAt) {
    if (theme.reservedAt.seconds) {
      const date = new Date(theme.reservedAt.seconds * 1000);
      formattedDate = date.toISOString().split("T")[0];
    } else if (theme.reservedAt instanceof Date) {
      formattedDate = theme.reservedAt.toISOString().split("T")[0];
    } else if (typeof theme.reservedAt === "string") {
      try {
        const date = new Date(theme.reservedAt);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        } else {
          formattedDate = "";
        }
      } catch (e) {
        formattedDate = "";
      }
    }
  }

  themeForm.value = {
    title: theme.title || "",
    description: theme.description || "",
    tags: theme.tags || [],
    available: theme.available !== undefined ? theme.available : true,
    reservedBy: theme.reservedBy || "",
    reservedAt: formattedDate,
  };

  showThemeModal.value = true;
};

// Confirmar eliminación de temática
const confirmDelete = (theme) => {
  selectedTheme.value = theme;
  showDeleteModal.value = true;
};

// Confirmar liberación de temática
const confirmRelease = (theme) => {
  selectedTheme.value = theme;
  showReleaseModal.value = true;
};

// Abrir imagen del juego en una nueva pestaña
const openGameImage = (imageUrl) => {
  if (imageUrl) {
    window.open(imageUrl, "_blank");
  }
};

// Guardar temática (crear o actualizar)
const saveTheme = async () => {
  if (!isFormValid.value) return;

  try {
    isSubmitting.value = true;

    const themeData = {
      title: themeForm.value.title.trim(),
      description: themeForm.value.description.trim(),
      tags: themeForm.value.tags,
      available: themeForm.value.available,
      updatedAt: serverTimestamp(),
    };

    // Si no está disponible, agregar información de reserva
    if (!themeData.available) {
      themeData.reservedBy = themeForm.value.reservedBy.trim();

      // Convertir a fecha si hay valor
      if (themeForm.value.reservedAt) {
        try {
          themeData.reservedAt = new Date(themeForm.value.reservedAt);
        } catch (e) {
          console.error("Error al convertir fecha:", e);
          themeData.reservedAt = serverTimestamp();
        }
      } else {
        themeData.reservedAt = serverTimestamp();
      }
    }

    if (isEditing.value && selectedTheme.value) {
      // Actualizar temática existente
      const themeRef = doc($firestore, "themes", selectedTheme.value.id);
      await updateDoc(themeRef, themeData);

      toast.add({
        title: "Éxito",
        description: "Temática actualizada correctamente",
        color: "green",
      });
    } else {
      // Crear nueva temática
      // Generar ID automático basado en la cantidad
      const nextNum = themes.value.length + 1;
      const themeId = `theme${nextNum}`;

      // Verificar si ya existe
      const themeRef = doc($firestore, "themes", themeId);
      const themeDoc = await getDoc(themeRef);

      if (themeDoc.exists()) {
        // Si existe, generar un ID con timestamp
        const timestamp = Date.now();
        const newId = `theme${nextNum}_${timestamp}`;
        const newThemeRef = doc($firestore, "themes", newId);
        await setDoc(newThemeRef, {
          ...themeData,
          createdAt: serverTimestamp(),
        });
      } else {
        // Si no existe, usar el ID secuencial
        await setDoc(themeRef, {
          ...themeData,
          createdAt: serverTimestamp(),
        });
      }

      toast.add({
        title: "Éxito",
        description: "Temática creada correctamente",
        color: "green",
      });
    }

    // Recargar temáticas
    await loadThemes();

    // Cerrar modal
    showThemeModal.value = false;
  } catch (error) {
    console.error("Error al guardar temática:", error);
    toast.add({
      title: "Error",
      description: "No se pudo guardar la temática. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Eliminar temática
const deleteTheme = async () => {
  if (!selectedTheme.value) return;

  try {
    isSubmitting.value = true;

    const themeRef = doc($firestore, "themes", selectedTheme.value.id);
    await deleteDoc(themeRef);

    toast.add({
      title: "Éxito",
      description: "Temática eliminada correctamente",
      color: "green",
    });

    // Recargar temáticas
    await loadThemes();

    // Cerrar modal
    showDeleteModal.value = false;
  } catch (error) {
    console.error("Error al eliminar temática:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar la temática. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Liberar temática
const releaseTheme = async () => {
  if (!selectedTheme.value) return;

  try {
    isSubmitting.value = true;

    const themeRef = doc($firestore, "themes", selectedTheme.value.id);
    await updateDoc(themeRef, {
      available: true,
      reservedBy: null,
      reservedAt: null,
      updatedAt: serverTimestamp(),
    });

    toast.add({
      title: "Éxito",
      description: "Temática liberada correctamente",
      color: "green",
    });

    // Recargar temáticas
    await loadThemes();

    // Cerrar modal
    showReleaseModal.value = false;
  } catch (error) {
    console.error("Error al liberar temática:", error);
    toast.add({
      title: "Error",
      description: "No se pudo liberar la temática. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Función para manejar el ordenamiento
const handleSort = (column) => {
  // Si es la misma columna, cambiar dirección
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    // Nueva columna, resetear a ascendente
    sortBy.value = column;
    sortDirection.value = "asc";
  }

  // Volver a la primera página al ordenar
  page.value = 1;
};

// Cargar datos al montar el componente
onMounted(async () => {
  await loadThemes();
});
</script>
