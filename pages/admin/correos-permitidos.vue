<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Gestión de Correos Permitidos</h1>

      <!-- Panel de migración -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold">
              Migrar correos del archivo estático
            </h3>
          </div>
        </template>
        <div class="p-6 space-y-6">
          <p class="text-gray-700 dark:text-gray-300">
            Esta acción migra la lista de correos permitidos desde el archivo
            estático
            <code class="bg-gray-100 dark:bg-gray-800 p-1 rounded"
              >allowed-emails.ts</code
            >
            a la base de datos de Firebase. Esto permite gestionar los correos
            de forma dinámica sin necesidad de modificar el código.
          </p>

          <div class="flex items-center space-x-4">
            <UCheckbox
              v-model="overwriteExisting"
              label="Sobrescribir datos existentes"
            />
            <UTooltip
              text="Si está marcado, eliminará todos los correos existentes en Firebase antes de importar los nuevos"
            >
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-information-circle"
                square
              />
            </UTooltip>
          </div>

          <div class="flex justify-end">
            <UButton
              color="primary"
              :loading="isMigrating"
              :disabled="isMigrating"
              @click="migrateEmails"
            >
              Migrar correos
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Formulario para agregar nuevo correo -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold">
              Agregar nuevo correo permitido
            </h3>
          </div>
        </template>
        <div class="p-6">
          <form @submit.prevent="addNewEmail" class="space-y-4">
            <div>
              <UFormGroup label="Correo electrónico" required>
                <UInput
                  v-model="newEmail"
                  placeholder="usuario@santotomas.cl o usuario@alumnos.santotomas.cl"
                  type="email"
                  :disabled="isAdding"
                />
              </UFormGroup>
            </div>
            <div class="flex justify-end">
              <UButton
                type="submit"
                color="primary"
                :loading="isAdding"
                :disabled="isAdding || !newEmail"
              >
                Agregar correo
              </UButton>
            </div>
          </form>
        </div>
      </UCard>

      <!-- Lista de correos permitidos -->
      <UCard>
        <template #header>
          <div
            class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
          >
            <h3 class="text-lg font-semibold">Correos permitidos</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-path"
              :loading="isLoading"
              @click="loadAllowedEmails"
            >
              Actualizar
            </UButton>
          </div>
        </template>
        <div>
          <!-- Estado de carga -->
          <div v-if="isLoading" class="flex justify-center items-center py-16">
            <UIcon
              name="i-heroicons-arrow-path"
              class="animate-spin h-12 w-12 text-primary"
            />
          </div>

          <!-- Error de carga -->
          <div v-else-if="error" class="p-8 text-center">
            <UIcon
              name="i-heroicons-exclamation-circle"
              class="h-16 w-16 mx-auto text-red-500 mb-4"
            />
            <h3 class="text-xl font-semibold mb-2">Error al cargar datos</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ error }}
            </p>
            <UButton color="primary" @click="loadAllowedEmails">
              Intentar nuevamente
            </UButton>
          </div>

          <!-- Tabla de correos -->
          <UTable
            v-else
            :columns="tableColumns"
            :rows="allowedEmails"
            :loading="isLoading"
            :empty-state="{
              icon: 'i-heroicons-inbox',
              label: 'No hay correos registrados',
            }"
          >
            <template #email-data="{ row }">
              <div class="font-medium">{{ row.email }}</div>
            </template>

            <template #type-data="{ row }">
              <UBadge
                :color="row.type === 'admin' ? 'blue' : 'green'"
                variant="subtle"
              >
                {{ row.type === "admin" ? "Administrador" : "Estudiante" }}
              </UBadge>
            </template>

            <template #created-at-data="{ row }">
              <div>{{ formatDate(row.createdAt) }}</div>
            </template>

            <template #status-data="{ row }">
              <UBadge :color="row.enabled ? 'green' : 'red'" variant="subtle">
                {{ row.enabled ? "Activo" : "Desactivado" }}
              </UBadge>
            </template>

            <template #actions-data="{ row }">
              <div class="flex items-center space-x-2">
                <UButton
                  v-if="!row.enabled"
                  color="green"
                  variant="ghost"
                  icon="i-heroicons-check"
                  size="xs"
                  @click="updateEmailStatus(row.id, true)"
                  :loading="row.isUpdating"
                />
                <UButton
                  v-else
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  size="xs"
                  @click="updateEmailStatus(row.id, false)"
                  :loading="row.isUpdating"
                />
              </div>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Definir metadatos de SEO
definePageMeta({
  title: "Gestión de Correos Permitidos",
  description:
    "Administra los correos electrónicos permitidos para registrarse en la plataforma",
  middleware: ["admin"], // Asegurar que solo los administradores pueden acceder
});

// Estado
const allowedEmails = ref([]);
const isLoading = ref(true);
const error = ref(null);
const overwriteExisting = ref(false);
const isMigrating = ref(false);
const newEmail = ref("");
const isAdding = ref(false);

// Estado de actualización para cada correo
const updateStates = ref({});

// Toast para notificaciones
const toast = useToast();

// Columnas para la tabla
const tableColumns = [
  {
    key: "email",
    label: "Correo electrónico",
  },
  {
    key: "type",
    label: "Tipo",
  },
  {
    key: "created-at",
    label: "Creado",
  },
  {
    key: "status",
    label: "Estado",
  },
  {
    key: "actions",
    label: "Acciones",
  },
];

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

    // Si es string o Date
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
    console.error("Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

// Cargar lista de correos permitidos
const loadAllowedEmails = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // TODO: Implementar obtención de datos desde el servidor
    // Por ahora simulamos la carga con un timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Esta parte se reemplazará con la llamada real a la API
    allowedEmails.value = [
      {
        id: "ricardoinostrozare_santotomas_cl",
        email: "ricardoinostrozare@santotomas.cl",
        type: "admin",
        enabled: true,
        createdAt: new Date(),
      },
      // Añadir más correos de ejemplo
    ];
  } catch (err) {
    console.error("Error al cargar correos permitidos:", err);
    error.value =
      "No se pudieron cargar los correos permitidos. Inténtalo de nuevo más tarde.";
  } finally {
    isLoading.value = false;
  }
};

// Migrar correos del archivo estático a Firebase
const migrateEmails = async () => {
  try {
    isMigrating.value = true;

    const response = await $fetch(
      `/api/admin/migrate-allowed-emails?overwrite=${overwriteExisting.value}`,
      { method: "POST" }
    );

    if (response.success) {
      toast.add({
        title: "Migración completada",
        description: response.message,
        color: "green",
      });

      // Recargar la lista de correos
      await loadAllowedEmails();
    } else {
      throw new Error(response.error || "Error durante la migración");
    }
  } catch (error) {
    console.error("Error durante la migración:", error);
    toast.add({
      title: "Error",
      description: error.message || "Ocurrió un error durante la migración",
      color: "red",
    });
  } finally {
    isMigrating.value = false;
  }
};

// Agregar nuevo correo permitido
const addNewEmail = async () => {
  if (!newEmail.value || isAdding.value) return;

  try {
    isAdding.value = true;

    const response = await $fetch("/api/admin/add-allowed-email", {
      method: "POST",
      body: {
        email: newEmail.value,
      },
    });

    if (response.success) {
      toast.add({
        title: "Correo agregado",
        description: response.message,
        color: "green",
      });

      // Limpiar el campo
      newEmail.value = "";

      // Recargar la lista
      await loadAllowedEmails();
    } else {
      throw new Error(response.error || "Error al agregar el correo");
    }
  } catch (error) {
    console.error("Error al agregar correo:", error);
    toast.add({
      title: "Error",
      description: error.message || "No se pudo agregar el correo",
      color: "red",
    });
  } finally {
    isAdding.value = false;
  }
};

// Actualizar estado de un correo (habilitar/deshabilitar)
const updateEmailStatus = async (id, newStatus) => {
  // Marcar como actualizando
  allowedEmails.value = allowedEmails.value.map((email) => {
    if (email.id === id) {
      return { ...email, isUpdating: true };
    }
    return email;
  });

  try {
    // TODO: Implementar la actualización real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Actualizar localmente (temporal)
    allowedEmails.value = allowedEmails.value.map((email) => {
      if (email.id === id) {
        return { ...email, enabled: newStatus, isUpdating: false };
      }
      return email;
    });

    toast.add({
      title: "Estado actualizado",
      description: `El correo ha sido ${
        newStatus ? "habilitado" : "deshabilitado"
      } correctamente`,
      color: "green",
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);

    // Revertir la marca de actualización
    allowedEmails.value = allowedEmails.value.map((email) => {
      if (email.id === id) {
        return { ...email, isUpdating: false };
      }
      return email;
    });

    toast.add({
      title: "Error",
      description: "No se pudo actualizar el estado del correo",
      color: "red",
    });
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadAllowedEmails();
});
</script>
