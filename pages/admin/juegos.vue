<template>
  <div>
    <UBreadcrumb
      :links="[
        { label: 'Inicio', to: '/admin' },
        { label: 'Administración de Juegos', to: '/admin/juegos' },
      ]"
      divider="|"
      class="mb-4"
    />

    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
    >
      <h1 class="text-2xl font-bold">Administración de Juegos</h1>
      <div class="mt-4 md:mt-0 flex space-x-2">
        <UButton
          color="primary"
          icon="i-heroicons-arrow-path"
          :loading="isLoading"
          @click="loadGames"
        >
          Actualizar
        </UButton>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UCard>
        <div class="flex items-center">
          <div
            class="bg-primary/10 p-3 rounded-full mr-4 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-play" class="text-2xl text-primary" />
          </div>
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Total de Juegos
            </div>
            <div class="text-2xl font-bold">{{ games.length }}</div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div
            class="bg-amber-100 dark:bg-amber-900 p-3 rounded-full mr-4 flex items-center justify-center"
          >
            <UIcon
              name="i-heroicons-clock"
              class="text-2xl text-amber-600 dark:text-amber-400"
            />
          </div>
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              En Progreso
            </div>
            <div class="text-2xl font-bold">
              {{
                games.filter(
                  (game) =>
                    normalizeGameStatus(game.gameStatus) === "en_desarrollo"
                ).length
              }}
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div
            class="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4 flex items-center justify-center"
          >
            <UIcon
              name="i-heroicons-check-badge"
              class="text-2xl text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Completados
            </div>
            <div class="text-2xl font-bold">
              {{
                games.filter((game) => game.gameStatus === "publicado").length
              }}
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Filtros y búsqueda -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
    >
      <div>
        <UFormGroup label="Buscar por título o desarrollador">
          <UInputGroup>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-magnifying-glass"
            />
            <UInput
              v-model="searchQuery"
              placeholder="Buscar juegos..."
              class="min-w-[180px]"
            />
          </UInputGroup>
        </UFormGroup>
      </div>

      <UFormGroup label="Filtrar por estado">
        <USelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="Todos los estados"
        />
      </UFormGroup>

      <UFormGroup label="Filtrar por categoría">
        <USelect
          v-model="selectedCategory"
          :options="categoryOptions"
          placeholder="Todas las categorías"
        />
      </UFormGroup>
    </div>

    <!-- Tabla de juegos -->
    <div
      class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow mb-6"
    >
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else-if="!filteredGames.length" class="py-16 text-center">
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
        <p class="text-lg text-gray-500">No se encontraron juegos</p>
        <p class="text-sm text-gray-400 mt-2">
          {{
            searchQuery
              ? "Intenta con otra búsqueda"
              : "No hay juegos con los filtros seleccionados"
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
              @click="handleSort('reservedBy')"
            >
              Desarrollador
              <span v-if="sortBy === 'reservedBy'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('gameStatus')"
            >
              Estado
              <span v-if="sortBy === 'gameStatus'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('reservedAt')"
            >
              Fecha Reserva
              <span v-if="sortBy === 'reservedAt'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
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
            v-for="game in paginatedGames"
            :key="game.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div
                class="w-8 h-8 rounded-full bg-primary-100 dark:bg-gray-600 flex items-center justify-center text-primary-600 dark:text-gray-200 font-semibold"
              >
                {{ getThemeNumber(game) }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ game.title }}
              </div>
              <div class="mt-1 flex flex-wrap gap-1">
                <span
                  v-for="tag in game.tags"
                  :key="tag"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col gap-1 mb-1">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-user" class="text-primary w-4 h-4" />
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ game.reservedBy || "No asignado" }}
                  </span>
                </div>
                <template v-if="game.teammateName || game.teammateEmail">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-heroicons-user"
                      class="text-primary w-4 h-4"
                    />
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{
                        game.teammateName ||
                        (game.teammateEmail
                          ? game.teammateEmail.split("@")[0]
                          : "") ||
                        game.teammateEmail
                      }}
                    </span>
                  </div>
                </template>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="
                  game.gameStatus === 'publicado'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : game.gameStatus === 'en_desarrollo'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                "
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ getStatusLabel(game.gameStatus) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(game.reservedAt) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex space-x-2">
                <button
                  @click="viewGameDetails(game)"
                  class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  title="Ver detalles"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  @click="editGameStatus(game)"
                  class="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                  title="Editar estado"
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación mejorada con botones numerados -->
      <div
        class="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando
            <span class="font-medium">{{
              filteredGames.length > 0 ? (page - 1) * pageSize + 1 : 0
            }}</span>
            a
            <span class="font-medium">{{
              Math.min(page * pageSize, filteredGames.length)
            }}</span>
            de
            <span class="font-medium">{{ filteredGames.length }}</span>
            juegos
          </div>

          <div class="flex space-x-2" v-if="filteredGames.length > pageSize">
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
              v-for="p in Math.min(
                5,
                Math.ceil(filteredGames.length / pageSize)
              )"
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
                  Math.ceil(filteredGames.length / pageSize),
                  page + 1
                )
              "
              :disabled="page >= Math.ceil(filteredGames.length / pageSize)"
              :class="
                page >= Math.ceil(filteredGames.length / pageSize)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              "
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del juego -->
    <Teleport to="body">
      <div
        v-if="showGameModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showGameModal = false"
        ></div>

        <!-- Modal content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-xl"
          >
            <!-- Header -->
            <div
              class="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Detalles del Juego
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  class="-my-1"
                  @click="showGameModal = false"
                />
              </div>
            </div>

            <!-- Body -->
            <div class="bg-white dark:bg-gray-900 px-4 py-4">
              <div v-if="selectedGame" class="space-y-4">
                <div>
                  <h4 class="font-medium mb-2">Información del Juego</h4>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        ID
                      </div>
                      <div class="font-medium">
                        {{ getThemeNumber(selectedGame) }}
                      </div>
                    </div>
                    <div class="col-span-2">
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        Título
                      </div>
                      <div class="font-medium">{{ selectedGame.title }}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Descripción
                  </div>
                  <div class="mt-1">{{ selectedGame.description }}</div>
                </div>

                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Categorías
                  </div>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <UBadge
                      v-for="tag in selectedGame.tags"
                      :key="tag"
                      color="violet"
                      variant="soft"
                    >
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      Desarrollador
                    </div>
                    <div class="flex flex-col gap-1 mt-1">
                      <div class="flex items-center gap-2">
                        <UIcon
                          name="i-heroicons-user"
                          class="text-primary w-4 h-4"
                        />
                        <span class="font-medium text-gray-900 dark:text-white">
                          {{ selectedGame.reservedBy || "No asignado" }}
                        </span>
                      </div>
                      <template
                        v-if="
                          selectedGame.teammateName ||
                          selectedGame.teammateEmail
                        "
                      >
                        <div class="flex items-center gap-2">
                          <UIcon
                            name="i-heroicons-user"
                            class="text-primary w-4 h-4"
                          />
                          <span
                            class="font-medium text-gray-900 dark:text-white"
                          >
                            {{
                              selectedGame.teammateName ||
                              (selectedGame.teammateEmail
                                ? selectedGame.teammateEmail.split("@")[0]
                                : "") ||
                              selectedGame.teammateEmail
                            }}
                          </span>
                        </div>
                      </template>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      Fecha de Reserva
                    </div>
                    <div class="font-medium">
                      {{ formatDate(selectedGame.reservedAt) }}
                    </div>
                  </div>
                </div>

                <div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Estado del Juego
                  </div>
                  <div class="mt-1">
                    <UBadge
                      :color="getStatusColor(selectedGame.gameStatus)"
                      size="md"
                      variant="soft"
                    >
                      {{ getStatusLabel(selectedGame.gameStatus) }}
                    </UBadge>
                  </div>
                </div>

                <!-- Imagen del juego si existe -->
                <div v-if="selectedGame.gameImage" class="my-4">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Imagen del Juego
                  </div>
                  <div class="mt-2">
                    <img
                      :src="selectedGame.gameImage"
                      :alt="selectedGame.title"
                      class="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div v-if="selectedGame.gameUrl">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    URL del Juego
                  </div>
                  <div class="mt-1">
                    <a
                      :href="selectedGame.gameUrl"
                      target="_blank"
                      class="text-primary hover:underline"
                    >
                      {{ selectedGame.gameUrl }}
                      <UIcon
                        name="i-heroicons-arrow-top-right-on-square"
                        class="inline ml-1 w-4 h-4"
                      />
                    </a>
                  </div>
                </div>

                <div v-if="selectedGame.repositoryUrl">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Repositorio
                  </div>
                  <div class="mt-1">
                    <a
                      :href="selectedGame.repositoryUrl"
                      target="_blank"
                      class="text-primary hover:underline"
                    >
                      {{ selectedGame.repositoryUrl }}
                      <UIcon
                        name="i-heroicons-arrow-top-right-on-square"
                        class="inline ml-1 w-4 h-4"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            >
              <UButton @click="showGameModal = false">Cerrar</UButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de edición de estado -->
    <Teleport to="body">
      <div
        v-if="showStatusModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showStatusModal = false"
        ></div>

        <!-- Modal content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-md"
          >
            <!-- Header -->
            <div
              class="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Actualizar Estado del Juego
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  class="-my-1"
                  @click="showStatusModal = false"
                />
              </div>
            </div>

            <!-- Body -->
            <div class="bg-white dark:bg-gray-900 px-4 py-4">
              <div v-if="selectedGame" class="space-y-4">
                <div>
                  <div class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {{ selectedGame.title }}
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1"
                    >Estado del Juego</label
                  >
                  <select
                    v-model="gameForm.gameStatus"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option disabled value="">Selecciona un estado</option>
                    <option value="borrador">Borrador</option>
                    <option value="en_desarrollo">En desarrollo</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1"
                    >URL del Juego</label
                  >
                  <input
                    v-model="gameForm.gameUrl"
                    type="text"
                    placeholder="https://ejemplo.com/juego"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1"
                    >URL del Repositorio</label
                  >
                  <input
                    v-model="gameForm.repositoryUrl"
                    type="text"
                    placeholder="https://github.com/usuario/repositorio"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            >
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:ml-3 sm:w-auto"
                :disabled="isSubmitting"
                @click="updateGameStatus"
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
                Guardar
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                @click="showStatusModal = false"
                :disabled="isSubmitting"
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
import { ref, computed, onMounted, watch } from "vue";
import { useGames } from "~/composables/useGames";
import {
  normalizeGameStatus,
  gameStatusLabel,
  gameStatusColor,
} from "~/composables/useGameStatus";

definePageMeta({
  middleware: ["admin"],
  layout: "admin",
});

// Referencias a composables
const toast = useToast();
const {
  games,
  loading: isLoading,
  error,
  fetchAllGames,
  updateGameStatus: updateGame,
} = useGames();

// Estado local
const searchQuery = ref("");
const filterStatus = ref(null);
const selectedCategory = ref(null);
const showGameModal = ref(false);
const showStatusModal = ref(false);
const selectedGame = ref(null);
const isSubmitting = ref(false);

// Variables para ordenación y paginación
const sortBy = ref("reservedAt");
const sortDirection = ref("desc");
const page = ref(1);
const pageSize = ref(10);

// Formulario para actualizar estado del juego
const gameForm = ref({
  gameStatus: "",
  gameUrl: "",
  repositoryUrl: "",
});

// Opciones para filtros
const statusOptions = [
  { label: "Todos", value: null },
  { label: "Borrador", value: "borrador" },
  { label: "En desarrollo", value: "en_desarrollo" },
  { label: "Publicado", value: "publicado" },
];

// Opciones de estado para el formulario (valores canónicos en Firestore)
const gameStatusOptions = [
  { label: "Borrador", value: "borrador" },
  { label: "En desarrollo", value: "en_desarrollo" },
  { label: "Publicado", value: "publicado" },
];

// Categorías para filtrado
const categoryOptions = [
  { label: "Todas", value: null },
  { label: "Historia", value: "Historia" },
  { label: "Cultura", value: "Cultura" },
  { label: "Geografía", value: "Geografía" },
  { label: "Biodiversidad", value: "Biodiversidad" },
  { label: "Tradiciones", value: "Tradiciones" },
  { label: "Gastronomía", value: "Gastronomía" },
  { label: "Arte", value: "Arte" },
  { label: "Leyendas", value: "Leyendas" },
  { label: "Pueblos Originarios", value: "Pueblos Originarios" },
  { label: "Personajes", value: "Personajes" },
];

// Filtrar juegos según búsqueda, categoría y estado
const filteredGames = computed(() => {
  let result = [...games.value];

  // Filtrar por búsqueda
  if (searchQuery.value?.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (game) =>
        game.title.toLowerCase().includes(query) ||
        (game.reservedBy && game.reservedBy.toLowerCase().includes(query)) ||
        game.description.toLowerCase().includes(query)
    );
  }

  // Filtrar por estado
  if (filterStatus.value) {
    result = result.filter(
      (game) => normalizeGameStatus(game.gameStatus) === filterStatus.value
    );
  }

  // Filtrar por categoría
  if (selectedCategory.value) {
    result = result.filter(
      (game) => game.tags && game.tags.includes(selectedCategory.value)
    );
  }

  // Ordenar
  result.sort((a, b) => {
    let aValue, bValue;

    // Manejo especial para ordenar IDs numéricamente
    if (sortBy.value === "id") {
      // Extraer componentes numéricos de los IDs
      aValue = parseInt(String(a.id).replace(/\D/g, "") || "0", 10);
      bValue = parseInt(String(b.id).replace(/\D/g, "") || "0", 10);
    } else {
      aValue = a[sortBy.value];
      bValue = b[sortBy.value];
    }

    // Manejo especial para fechas en formato string o timestamp
    if (sortBy.value === "reservedAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Comparación según dirección de ordenación
    if (sortDirection.value === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return result;
});

// Paginación
const totalPages = computed(() =>
  Math.ceil(filteredGames.value.length / pageSize.value)
);

const startIndex = computed(() => (page.value - 1) * pageSize.value);

const endIndex = computed(() =>
  Math.min(startIndex.value + pageSize.value, filteredGames.value.length)
);

const paginatedGames = computed(() =>
  filteredGames.value.slice(startIndex.value, endIndex.value)
);

// Resetear página cuando cambian los filtros
watch([searchQuery, filterStatus, selectedCategory], () => {
  page.value = 1;
});

// Obtener el número de la temática desde el ID
const getThemeNumber = (game) => {
  // Primero verificar si el objeto tiene un campo 'id' interno
  if (game && typeof game === "object") {
    // Si tiene un campo 'numero', usarlo con prioridad
    if (game.numero !== undefined) {
      return game.numero;
    }

    // Buscar el campo 'id' interno (no el ID del documento)
    if (game.id !== undefined && typeof game.id === "string") {
      // Extraer solo los dígitos del ID interno
      const matches = game.id.match(/\d+/);
      if (matches && matches[0]) {
        return matches[0];
      }
    }
  }

  // Si llega aquí, intentar extraer dígitos del ID como string
  const idStr = String(game?.id || game || "");
  const match = idStr.match(/\d+/);
  return match ? match[0] : "N/A";
};

// Formatear fecha
const formatDate = (date) => {
  if (!date) return "N/A";

  // Manejar diferentes tipos de fechas
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (date && typeof date.toDate === "function") {
    // Firebase Timestamp
    dateObj = date.toDate();
  } else {
    return "Fecha inválida";
  }

  // Formatear como DD/MM/YYYY
  return dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusColor = (status) => gameStatusColor(status);
const getStatusLabel = (status) => gameStatusLabel(status);

// Función para manejar el ordenamiento (reemplaza la función changeSorting)
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

// Cargar juegos
const loadGames = async () => {
  try {
    await fetchAllGames();

    if (error.value) {
      toast.add({
        title: "Error",
        description: error.value,
        color: "red",
      });
      return;
    }

    toast.add({
      title: "Éxito",
      description: `Se cargaron ${games.value.length} juegos`,
      color: "green",
    });
  } catch (error) {
    console.error("Error al cargar juegos:", error);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar los juegos",
      color: "red",
    });
  }
};

// Ver detalles de un juego
const viewGameDetails = (game) => {
  selectedGame.value = { ...game };
  showGameModal.value = true;
};

// Editar estado de un juego
const editGameStatus = (game) => {
  console.log("Game recibido para editar:", {
    game: game.title,
    id: game.id,
    _docId: game._docId || "No tiene _docId",
    props: Object.keys(game),
  });

  selectedGame.value = { ...game };

  // Inicializar formulario con valores actuales o usar valores por defecto según el nuevo esquema
  gameForm.value = {
    gameStatus: normalizeGameStatus(game.gameStatus),
    gameUrl: game.gameUrl || "",
    repositoryUrl: game.repositoryUrl || "",
  };

  showStatusModal.value = true;
};

// Actualizar estado del juego
const updateGameStatus = async () => {
  if (!selectedGame.value) return;

  try {
    isSubmitting.value = true;

    // Aquí está la clave - usar el _docId en lugar del id interno
    const documentId = selectedGame.value._docId || selectedGame.value.id;

    console.log("Actualizando estado del juego:", {
      id: selectedGame.value.id,
      _docId: documentId,
      nuevoEstado: gameForm.value.gameStatus,
      url: gameForm.value.gameUrl,
      repo: gameForm.value.repositoryUrl,
    });

    const result = await updateGame(documentId, {
      gameStatus: gameForm.value.gameStatus,
      gameUrl: gameForm.value.gameUrl || "",
      repositoryUrl: gameForm.value.repositoryUrl || "",
    });

    if (!result.success) {
      throw new Error(result.error || "Error al actualizar estado");
    }

    // Actualizar el juego en la lista local
    const index = games.value.findIndex(
      (g) => g.id === selectedGame.value.id || g._docId === documentId
    );
    if (index !== -1) {
      games.value[index] = {
        ...games.value[index],
        gameStatus: gameForm.value.gameStatus,
        gameUrl: gameForm.value.gameUrl || "",
        repositoryUrl: gameForm.value.repositoryUrl || "",
      };
    }

    toast.add({
      title: "Éxito",
      description: "Estado del juego actualizado correctamente",
      color: "green",
    });

    // Cerrar modal
    showStatusModal.value = false;
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    toast.add({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del juego",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Cargar juegos al montar el componente
onMounted(() => {
  loadGames();
});
</script>
