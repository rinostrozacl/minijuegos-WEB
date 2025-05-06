<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-green-600 mb-6">
        Competencia de Minijuegos con Temáticas Chilenas
      </h1>
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 mb-8">
        <h2 class="text-2xl font-semibold mb-4">
          Bienvenido a la Plataforma de Competencia
        </h2>
        <p class="text-lg mb-6">
          Esta es la portada de la aplicación de la competencia de minijuegos
          con temáticas chilenas. Aquí los participantes podrán registrarse,
          subir sus juegos y participar en la evaluación.
        </p>
        <UButton size="lg" color="green" class="mr-4"> Conocer más </UButton>
        <UButton size="lg" variant="outline"> Iniciar sesión </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Inicio",
  description: "Plataforma de competencia de minijuegos con temáticas chilenas",
});
</script>
