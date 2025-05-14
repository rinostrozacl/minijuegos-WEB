<template>
  <div class="phase-indicator">
    <UBadge
      :color="phaseColor"
      :variant="variant"
      size="lg"
      :ui="{ rounded: 'rounded-full' }"
      class="px-3 py-1 text-sm"
    >
      <div class="flex items-center space-x-1">
        <span v-if="showIcon" class="relative flex h-2 w-2 mr-1">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            :class="phaseColor ? `bg-${phaseColor}-400` : 'bg-gray-400'"
          ></span>
          <span
            class="relative inline-flex rounded-full h-2 w-2"
            :class="phaseColor ? `bg-${phaseColor}-500` : 'bg-gray-500'"
          ></span>
        </span>
        {{ phaseLabel }}
      </div>
    </UBadge>
  </div>
</template>

<script setup>
const props = defineProps({
  phase: {
    type: String,
    default: "preparation",
    validator: (value) =>
      [
        "preparation",
        "reservation",
        "development",
        "submission",
        "evaluation",
        "announcement",
        "finished",
      ].includes(value),
  },
  variant: {
    type: String,
    default: "solid",
    validator: (value) => ["solid", "soft", "outline"].includes(value),
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
});

// Mapa de fases a colores
const phaseColorMap = {
  preparation: "blue",
  reservation: "indigo",
  development: "violet",
  submission: "orange",
  evaluation: "amber",
  announcement: "emerald",
  finished: "gray",
};

// Mapa de fases a etiquetas en español
const phaseLabelMap = {
  preparation: "Fase de preparación",
  reservation: "Reserva de temáticas",
  development: "Desarrollo activo",
  submission: "Fase de entrega",
  evaluation: "En evaluación",
  announcement: "Resultados publicados",
  finished: "Concurso finalizado",
};

// Calcular color según la fase
const phaseColor = computed(() => {
  return phaseColorMap[props.phase] || "gray";
});

// Obtener etiqueta en español según la fase
const phaseLabel = computed(() => {
  return phaseLabelMap[props.phase] || "Estado desconocido";
});
</script>
