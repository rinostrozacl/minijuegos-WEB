<template>
  <div class="p-10 space-y-4">
    <h1 class="text-3xl font-bold mb-4">Página de Prueba - Nuxt UI</h1>

    <p>
      Si Nuxt UI funciona, deberías ver componentes estilizados a continuación:
    </p>

    <UButton label="Botón Primario (UButton)" color="primary" />
    <UButton label="Botón Gris (UButton)" color="gray" variant="outline" />

    <UCard>
      <template #header> Encabezado de Tarjeta (UCard) </template>
      <p>Este es el contenido dentro de un componente UCard.</p>
      <template #footer> Pie de Tarjeta (UCard) </template>
    </UCard>

    <UAlert
      title="Alerta (UAlert)"
      description="Este es un componente UAlert."
      color="blue"
      variant="subtle"
    />

    <UIcon name="i-heroicons-check-circle" class="text-green-500 w-8 h-8" />
    <span>Icono (UIcon)</span>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Test Nuxt UI",
});
</script>
