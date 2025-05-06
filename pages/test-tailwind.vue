<template>
  <div class="p-10">
    <h1 class="text-3xl font-bold text-blue-600 mb-4">
      Página de Prueba - Tailwind CSS
    </h1>

    <p class="mb-2 text-gray-700">
      Si Tailwind funciona, este texto debería tener estilo.
    </p>

    <div class="mt-6 p-4 bg-yellow-200 border border-yellow-400 rounded">
      <p class="font-semibold text-yellow-800">
        Este es un contenedor con fondo amarillo, borde y esquinas redondeadas.
      </p>
    </div>

    <button
      class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      Botón HTML con Clases Tailwind
    </button>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Test Tailwind",
});
</script>
