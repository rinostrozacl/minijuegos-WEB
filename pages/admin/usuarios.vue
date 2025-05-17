<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Administración de Usuarios</h1>
      <UButton color="indigo" @click="openNewUserModal" icon="i-heroicons-plus">
        Nuevo usuario
      </UButton>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UCard class="bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xl font-bold">{{ users.length }}</div>
            <div class="text-sm text-gray-500">Total de usuarios</div>
          </div>
          <UIcon
            name="i-heroicons-users"
            class="text-indigo-600 h-8 w-8 opacity-80"
          />
        </div>
      </UCard>

      <UCard class="bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xl font-bold">{{ adminCount }}</div>
            <div class="text-sm text-gray-500">Administradores</div>
          </div>
          <UIcon
            name="i-heroicons-shield-check"
            class="text-green-600 h-8 w-8 opacity-80"
          />
        </div>
      </UCard>

      <UCard class="bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xl font-bold">{{ studentCount }}</div>
            <div class="text-sm text-gray-500">Estudiantes</div>
          </div>
          <UIcon
            name="i-heroicons-academic-cap"
            class="text-amber-600 h-8 w-8 opacity-80"
          />
        </div>
      </UCard>
    </div>

    <!-- Búsqueda y filtros -->
    <div class="mb-6 flex flex-col md:flex-row gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Buscar por nombre o email..."
        icon="i-heroicons-magnifying-glass"
        class="flex-grow"
      />

      <USelectMenu
        v-model="filterRole"
        placeholder="Rol"
        :options="roleOptions"
        class="w-full md:w-48"
      />

      <USelectMenu
        v-model="filterStatus"
        placeholder="Estado"
        :options="statusOptions"
        class="w-full md:w-48"
      />
    </div>

    <!-- Tabla de usuarios -->
    <div
      class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow mb-6"
    >
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
        ></div>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="py-16 text-center">
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
        <p class="text-lg text-gray-500">No se encontraron usuarios</p>
        <p class="text-sm text-gray-400 mt-2">
          {{
            searchQuery
              ? "Intenta con otra búsqueda"
              : "Aún no hay usuarios registrados"
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
              @click="handleSort('name')"
            >
              Nombre
              <span v-if="sortBy === 'name'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('email')"
            >
              Email
              <span v-if="sortBy === 'email'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('role')"
            >
              Rol
              <span v-if="sortBy === 'role'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              @click="handleSort('isActive')"
            >
              Estado
              <span v-if="sortBy === 'isActive'" class="ml-1">
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Registrado
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
            v-for="user in paginatedUsers"
            :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div
                  class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold"
                >
                  {{ getInitials(user.name) }}
                </div>
                <div class="ml-4">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ user.name }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ user.email }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="
                  user.role === 'admin'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100'
                    : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                "
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ user.role === "admin" ? "Administrador" : "Estudiante" }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="
                  user.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                "
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ user.isActive ? "Activo" : "Inactivo" }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
            >
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex space-x-2">
                <button
                  @click="editUser(user)"
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
                  @click="confirmToggleUserStatus(user)"
                  :class="
                    user.isActive
                      ? 'text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300'
                      : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                  "
                  :title="
                    user.isActive ? 'Desactivar usuario' : 'Activar usuario'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      v-if="user.isActive"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                    <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                <button
                  @click="confirmDelete(user)"
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
          filteredUsers.length > 0 ? (page - 1) * pageSize + 1 : 0
        }}</span>
        a
        <span class="font-medium">{{
          Math.min(page * pageSize, filteredUsers.length)
        }}</span>
        de
        <span class="font-medium">{{ filteredUsers.length }}</span>
        usuarios
      </div>

      <div class="flex space-x-2" v-if="filteredUsers.length > pageSize">
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
          v-for="p in Math.min(5, Math.ceil(filteredUsers.length / pageSize))"
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
              Math.ceil(filteredUsers.length / pageSize),
              page + 1
            )
          "
          :disabled="page >= Math.ceil(filteredUsers.length / pageSize)"
          :class="
            page >= Math.ceil(filteredUsers.length / pageSize)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          "
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de creación/edición de usuarios -->
    <Teleport to="body">
      <div
        v-if="showUserModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showUserModal = false"
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
                  {{ isEditing ? "Editar usuario" : "Nuevo usuario" }}
                </h3>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="showUserModal = false"
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
                    :class="{ 'text-red-500': errorName }"
                    >Nombre completo <span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    v-model="userForm.name"
                    placeholder="Nombre del usuario"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errorName }"
                  />
                  <p v-if="errorName" class="text-red-500 text-xs mt-1">
                    El nombre es obligatorio
                  </p>
                </div>

                <div class="mb-4">
                  <label
                    class="block text-sm font-medium mb-1"
                    :class="{ 'text-red-500': errorEmail }"
                    >Email <span class="text-red-500">*</span></label
                  >
                  <input
                    type="email"
                    v-model="userForm.email"
                    placeholder="Email del usuario"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errorEmail }"
                  />
                  <p v-if="errorEmail" class="text-red-500 text-xs mt-1">
                    El email es obligatorio y debe ser válido
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Rol</label>
                  <select
                    v-model="userForm.role"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="student">Estudiante</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Estado</label>
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      v-model="userForm.isActive"
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{{ userForm.isActive ? "Activo" : "Inactivo" }}</span>
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
                class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                :disabled="!isFormValid || isSubmitting"
                @click="saveUser"
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
                @click="showUserModal = false"
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
                  Eliminar usuario
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
                  ¿Estás seguro que deseas eliminar al usuario
                  <strong>{{ selectedUser?.name }}</strong
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
                @click="deleteUser"
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

    <!-- Modal de confirmación para cambio de estado -->
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
            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:w-full sm:max-w-lg"
          >
            <!-- Header -->
            <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6">
              <div class="flex justify-between items-center">
                <h3
                  class="text-xl font-semibold"
                  :class="
                    selectedUser?.isActive ? 'text-amber-600' : 'text-green-600'
                  "
                >
                  {{ selectedUser?.isActive ? "Desactivar" : "Activar" }}
                  usuario
                </h3>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="showStatusModal = false"
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
                  ¿Estás seguro que deseas
                  {{ selectedUser?.isActive ? "desactivar" : "activar" }} al
                  usuario <strong>{{ selectedUser?.name }}</strong
                  >?
                </p>
                <p
                  class="text-sm mt-2"
                  :class="
                    selectedUser?.isActive ? 'text-amber-600' : 'text-green-600'
                  "
                >
                  {{
                    selectedUser?.isActive
                      ? "El usuario no podrá acceder a la plataforma hasta que sea activado nuevamente."
                      : "El usuario podrá acceder a la plataforma nuevamente."
                  }}
                </p>
              </div>
            </div>

            <!-- Footer con botones -->
            <div
              class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
            >
              <button
                type="button"
                :class="
                  selectedUser?.isActive
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-green-600 hover:bg-green-500'
                "
                class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                :disabled="isSubmitting"
                @click="toggleUserStatus"
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
                {{ selectedUser?.isActive ? "Desactivar" : "Activar" }}
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                @click="showStatusModal = false"
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
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

definePageMeta({
  middleware: ["admin"],
  layout: "admin",
});

// Estado
const users = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const searchQuery = ref("");
const filterRole = ref(null);
const filterStatus = ref(null);
const showUserModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedUser = ref(null);

// Variables para ordenación y paginación
const sortBy = ref("name");
const sortDirection = ref("asc");
const page = ref(1);
const pageSize = ref(10);

// Variables para validación de formulario
const errorName = ref(false);
const errorEmail = ref(false);

// Opciones para filtros
const roleOptions = [
  { label: "Todos", value: null },
  { label: "Administradores", value: "admin" },
  { label: "Estudiantes", value: "student" },
];

const statusOptions = [
  { label: "Todos", value: null },
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
];

// Formulario para crear/editar usuarios
const userForm = ref({
  name: "",
  email: "",
  role: "student",
  isActive: true,
});

// Contadores
const adminCount = computed(() => {
  return users.value.filter((user) => user.role === "admin").length;
});

const studentCount = computed(() => {
  return users.value.filter((user) => user.role === "student").length;
});

// Acceso a Firebase
const { $firestore } = useNuxtApp();
const toast = useToast();

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
  await loadUsers();
});

// Variables adicionales para modales
const showStatusModal = ref(false);

// Función para obtener iniciales del nombre
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Filtrado de usuarios
const filteredUsers = computed(() => {
  let result = [...users.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }

  // Filtrar por rol
  if (filterRole.value) {
    result = result.filter((user) => user.role === filterRole.value);
  }

  // Filtrar por estado
  if (filterStatus.value === "active") {
    result = result.filter((user) => user.isActive);
  } else if (filterStatus.value === "inactive") {
    result = result.filter((user) => !user.isActive);
  }

  // Ordenar por la columna seleccionada
  if (sortBy.value) {
    result.sort((a, b) => {
      let aValue = a[sortBy.value];
      let bValue = b[sortBy.value];

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

// Usuarios paginados (para mostrar en la tabla)
const paginatedUsers = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// Validación de formulario
const isFormValid = computed(() => {
  // Reiniciar estado de errores
  errorName.value = userForm.value.name.trim() === "";
  errorEmail.value =
    userForm.value.email.trim() === "" || !validateEmail(userForm.value.email);

  return !errorName.value && !errorEmail.value;
});

// Validar email
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
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

// Cargar usuarios desde Firestore
const loadUsers = async () => {
  try {
    console.log("[DEBUG] Iniciando carga de usuarios...");
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
    console.log("[DEBUG] Intentando acceder a la colección 'users'...");
    const usersCollection = collection($firestore, "users");

    console.log("[DEBUG] Obteniendo documentos...");
    const querySnapshot = await getDocs(usersCollection);
    console.log("[DEBUG] Query snapshot obtenido, tamaño:", querySnapshot.size);

    if (querySnapshot.empty) {
      console.log(
        "[DEBUG] No se encontraron documentos en la colección 'users'"
      );
      users.value = [];
      return;
    }

    const usersData = [];
    querySnapshot.forEach((doc) => {
      console.log("[DEBUG] Usuario encontrado:", doc.id);
      const data = doc.data();
      usersData.push({
        id: doc.id,
        ...data,
      });
    });

    console.log("[DEBUG] Total de usuarios procesados:", usersData.length);
    users.value = usersData;
    console.log("[DEBUG] Usuarios cargados completo:", users.value.length);
  } catch (error) {
    console.error("[DEBUG] Error al cargar usuarios:", error);
    toast.add({
      title: "Error",
      description: "No se pudieron cargar los usuarios. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// Abrir modal para nuevo usuario
const openNewUserModal = () => {
  isEditing.value = false;
  userForm.value = {
    name: "",
    email: "",
    role: "student",
    isActive: true,
  };
  showUserModal.value = true;
};

// Abrir modal para editar usuario
const editUser = (user) => {
  isEditing.value = true;
  selectedUser.value = user;

  userForm.value = {
    name: user.name || "",
    email: user.email || "",
    role: user.role || "student",
    isActive: user.isActive !== undefined ? user.isActive : true,
  };

  showUserModal.value = true;
};

// Confirmar eliminación de usuario
const confirmDelete = (user) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

// Confirmar cambio de estado de usuario
const confirmToggleUserStatus = (user) => {
  selectedUser.value = user;
  showStatusModal.value = true;
};

// Guardar usuario (crear o actualizar)
const saveUser = async () => {
  if (!isFormValid.value) return;

  try {
    isSubmitting.value = true;

    const userData = {
      name: userForm.value.name.trim(),
      email: userForm.value.email.trim().toLowerCase(),
      role: userForm.value.role,
      isActive: userForm.value.isActive,
      updatedAt: serverTimestamp(),
    };

    if (isEditing.value && selectedUser.value) {
      // Actualizar usuario existente
      const userRef = doc($firestore, "users", selectedUser.value.id);
      await updateDoc(userRef, userData);

      toast.add({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
        color: "green",
      });
    } else {
      // Crear nuevo usuario
      // En una implementación real, esto requeriría integrarse con Firebase Auth
      // para crear una cuenta de usuario con email/password
      // Aquí simulamos la creación de un documento en Firestore

      // Generamos un ID para el documento
      const userId = `user_${Date.now()}`;
      const userRef = doc($firestore, "users", userId);

      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      });

      toast.add({
        title: "Éxito",
        description: "Usuario creado correctamente",
        color: "green",
      });
    }

    // Recargar usuarios
    await loadUsers();

    // Cerrar modal
    showUserModal.value = false;
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    toast.add({
      title: "Error",
      description: "No se pudo guardar el usuario. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Eliminar usuario
const deleteUser = async () => {
  if (!selectedUser.value) return;

  try {
    isSubmitting.value = true;

    // En una implementación real, también deberías eliminar la cuenta de Firebase Auth
    const userRef = doc($firestore, "users", selectedUser.value.id);
    await deleteDoc(userRef);

    toast.add({
      title: "Éxito",
      description: "Usuario eliminado correctamente",
      color: "green",
    });

    // Recargar usuarios
    await loadUsers();

    // Cerrar modal
    showDeleteModal.value = false;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    toast.add({
      title: "Error",
      description: "No se pudo eliminar el usuario. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Cambiar estado de usuario
const toggleUserStatus = async () => {
  if (!selectedUser.value) return;

  try {
    isSubmitting.value = true;

    const userRef = doc($firestore, "users", selectedUser.value.id);
    await updateDoc(userRef, {
      isActive: !selectedUser.value.isActive,
      updatedAt: serverTimestamp(),
    });

    toast.add({
      title: "Éxito",
      description: selectedUser.value.isActive
        ? "Usuario desactivado correctamente"
        : "Usuario activado correctamente",
      color: "green",
    });

    // Recargar usuarios
    await loadUsers();

    // Cerrar modal
    showStatusModal.value = false;
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    toast.add({
      title: "Error",
      description:
        "No se pudo cambiar el estado del usuario. Intenta nuevamente.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
