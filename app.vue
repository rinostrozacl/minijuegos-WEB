<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Verificar las variables de entorno al cargar la aplicación
onMounted(() => {
  console.log("====== APP.VUE MOUNTED ======");
  const config = useRuntimeConfig();
  console.log("Firebase config (público) disponible en el cliente:", {
    apiKeyExists: !!config.public.firebaseApiKey,
    apiKeyLength: config.public.firebaseApiKey?.length || 0,
    authDomainExists: !!config.public.firebaseAuthDomain,
    projectIdExists: !!config.public.firebaseProjectId,
    projectId: config.public.firebaseProjectId || "no disponible",
  });
  console.log("============================");
});
</script>
