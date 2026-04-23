<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Configuración del Sistema</h1>

      <UCard v-if="isLoading" class="p-8 mb-8">
        <div class="flex justify-center">
          <UIcon
            name="i-heroicons-arrow-path"
            class="animate-spin text-primary h-8 w-8"
          />
          <span class="ml-2">Cargando configuración...</span>
        </div>
      </UCard>

      <template v-else>
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Sección de Estado del Sistema -->
          <UCard>
            <template #header>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-cog-6-tooth" class="text-primary" />
                <h2 class="text-xl font-semibold">Estado del Sistema</h2>
              </div>
            </template>

            <div class="p-4 space-y-6">
              <!-- Habilitar registro de usuarios -->
              <div class="flex justify-between items-center">
                <div>
                  <label class="font-medium block">Registro de usuarios</label>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Permitir que nuevos usuarios puedan registrarse en la
                    plataforma
                  </p>
                </div>
                <USwitch
                  v-model="formConfig.isRegistrationEnabled"
                  color="primary"
                />
              </div>

              <hr class="my-4 border-gray-200 dark:border-gray-700" />

              <!-- Habilitar reserva de temáticas -->
              <div class="flex justify-between items-center">
                <div>
                  <label class="font-medium block">Reserva de temáticas</label>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Permitir que los usuarios puedan reservar temáticas para sus
                    proyectos
                  </p>
                </div>
                <USwitch
                  v-model="formConfig.isReservationEnabled"
                  color="primary"
                />
              </div>

              <hr class="my-4 border-gray-200 dark:border-gray-700" />

              <!-- Año del concurso -->
              <div>
                <label class="font-medium block mb-2">Año del concurso</label>
                <UInput
                  v-model="formConfig.currentYear"
                  type="number"
                  min="2026"
                  max="2050"
                />
              </div>
            </div>
          </UCard>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-4">
            <UButton
              type="button"
              variant="soft"
              color="gray"
              @click="resetForm"
            >
              Cancelar
            </UButton>
            <UButton
              type="submit"
              variant="solid"
              color="primary"
              :loading="isSaving"
              :disabled="!hasChanges"
            >
              Guardar cambios
            </UButton>
          </div>
        </form>

        <!-- Información de última actualización -->
        <div class="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p v-if="lastUpdated">
            Última actualización: {{ formatDate(lastUpdated) }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
  title: "Configuración del Sistema",
  layout: "admin",
});

import { ref, computed } from "vue";

const { config, isLoading, updateConfig } = useSystemConfig();

const formConfig = ref({
  isRegistrationEnabled: true,
  isReservationEnabled: false,
  currentPhase: "preparation",
  currentYear: new Date().getFullYear(),
});

const originalConfig = ref({});
const isSaving = ref(false);

// Detector de cambios para habilitar el botón de guardar
const hasChanges = computed(() => {
  // Comparar formConfig con originalConfig
  return (
    JSON.stringify(formConfig.value) !== JSON.stringify(originalConfig.value)
  );
});

// Obtener timestamp de última actualización
const lastUpdated = computed(() => {
  if (config.value?.lastUpdated) {
    // Si es un objeto de Firestore con _seconds
    if (config.value.lastUpdated._seconds) {
      return new Date(config.value.lastUpdated._seconds * 1000);
    }
    // Si es un objeto Date
    return config.value.lastUpdated;
  }
  return null;
});

// Función para formatear fecha
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Cargar configuración
onMounted(async () => {
  // Cargar datos iniciales
  if (config.value) {
    formConfig.value = {
      isRegistrationEnabled: config.value.isRegistrationEnabled ?? true,
      isReservationEnabled: config.value.isReservationEnabled ?? false,
      currentPhase: config.value.currentPhase ?? "preparation",
      currentYear: config.value.currentYear ?? new Date().getFullYear(),
    };

    // Guardar para comparar después
    originalConfig.value = { ...formConfig.value };
  }
});

// Función para enviar el formulario
const handleSubmit = async () => {
  isSaving.value = true;

  try {
    const success = await updateConfig({
      isRegistrationEnabled: formConfig.value.isRegistrationEnabled,
      isReservationEnabled: formConfig.value.isReservationEnabled,
      currentPhase: formConfig.value.currentPhase,
      currentYear: formConfig.value.currentYear,
    });

    if (success) {
      // Actualizar valores originales para comparación
      originalConfig.value = { ...formConfig.value };

      // Mostrar mensaje de éxito
      useToast().add({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente",
        icon: "i-heroicons-check-circle",
        color: "green",
      });
    } else {
      throw new Error("No se pudo actualizar la configuración");
    }
  } catch (error) {
    console.error("Error al guardar configuración:", error);

    // Mostrar mensaje de error
    useToast().add({
      title: "Error",
      description: "No se pudo guardar la configuración",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
};

// Función para resetear el formulario
const resetForm = () => {
  formConfig.value = { ...originalConfig.value };

  useToast().add({
    title: "Cambios descartados",
    description: "Se han descartado los cambios no guardados",
    icon: "i-heroicons-arrow-path",
    color: "gray",
  });
};
</script>
