<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-4">Mi Juego</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Información sobre tu temática reservada y estado de tu juego.
          </p>
        </div>

        <!-- Botón para refrescar -->
        <UButton
          v-if="isLoggedIn"
          @click="refreshUserData"
          color="primary"
          variant="soft"
          :loading="isLoading"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" />
          </template>
          Actualizar datos
        </UButton>
      </div>
    </div>

    <!-- Pantalla de carga -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 text-primary"
      />
    </div>

    <!-- Mensaje si el usuario no está autenticado -->
    <div v-else-if="!isLoggedIn" class="text-center py-16">
      <UIcon
        name="i-heroicons-lock-closed"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Acceso restringido</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Debes iniciar sesión para acceder a esta sección y ver la información de
        tu juego.
      </p>
      <UButton to="/ingresar" color="primary" size="lg">
        Iniciar sesión
      </UButton>
    </div>

    <!-- Mensaje si el usuario no ha reservado ninguna temática -->
    <div v-else-if="!userHasTheme" class="text-center py-16">
      <UIcon
        name="i-heroicons-puzzle-piece"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold mb-2">Aún no has reservado temática</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        Para desarrollar tu juego, primero debes reservar una temática
        disponible. Las temáticas son la base creativa de tu proyecto.
      </p>

      <!-- Información de depuración -->
      <div
        class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-w-md mx-auto mb-8 text-left text-sm"
      >
        <p class="font-bold mb-2">Información de depuración:</p>
        <p>
          Estado de autenticación:
          {{ isLoggedIn ? "Autenticado" : "No autenticado" }}
        </p>
        <p>Email del usuario: {{ user?.email || "No disponible" }}</p>
        <p>
          Datos reservedTheme:
          {{
            user?.reservedTheme ? JSON.stringify(user.reservedTheme) : "null"
          }}
        </p>
        <p class="mt-2 text-xs text-gray-500">
          Si acabas de reservar una temática, intenta recargar la página.
        </p>

        <div class="mt-4 text-center">
          <UButton
            @click="refreshUserData"
            color="primary"
            variant="soft"
            size="sm"
            :loading="isLoading"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" />
            </template>
            Refrescar datos
          </UButton>
        </div>
      </div>

      <UButton to="/tematicas" color="primary" size="lg">
        Ver temáticas disponibles
      </UButton>
    </div>

    <!-- Contenido cuando el usuario tiene una temática reservada -->
    <div v-else-if="themeDetails">
      <!-- Tarjeta de la temática -->
      <UCard class="mb-8 overflow-hidden border-0 shadow-lg">
        <template #header>
          <div class="relative bg-primary/10 rounded-t-lg p-6">
            <div class="flex items-center">
              <div
                class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md border-2 border-white dark:border-gray-800"
              >
                {{ getThemeNumber(themeDetails.id) }}
              </div>
              <div>
                <h2 class="text-2xl font-bold">{{ themeDetails.title }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Reservada el {{ formatDate(reservationDate) }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <div class="p-6">
          <div class="prose dark:prose-invert max-w-none">
            <h3 class="text-xl font-semibold mb-4">Descripción</h3>
            <p>{{ themeDetails.description }}</p>

            <!-- Etiquetas/categorías -->
            <div
              v-if="themeDetails.tags && themeDetails.tags.length > 0"
              class="mt-6"
            >
              <h3 class="text-xl font-semibold mb-4">Categorías</h3>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in themeDetails.tags"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                  class="text-sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Información sobre el estado del juego -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Estado de mi juego</h3>
          </div>
        </template>

        <div class="p-6">
          <!-- Si no hay juego creado todavía -->
          <div v-if="!userGame" class="text-center py-8">
            <UIcon
              name="i-heroicons-plus-circle"
              class="h-16 w-16 mx-auto text-gray-400 mb-4"
            />
            <h4 class="text-lg font-semibold mb-2">
              No has registrado tu juego
            </h4>
            <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Con tu temática reservada, ya puedes empezar a desarrollar tu
              juego para el concurso.
            </p>
            <UButton color="primary">
              <template #leading>
                <UIcon name="i-heroicons-plus" />
              </template>
              Registrar mi juego
            </UButton>
          </div>

          <!-- Cuando ya existe un juego (esta parte se implementará más adelante) -->
          <div v-else class="space-y-6">
            <!-- Información básica del juego registrado -->
            <!-- Progreso de desarrollo -->
            <!-- Plazo restante para entrega -->
          </div>
        </div>
      </UCard>

      <!-- Recursos y guías -->
      <UCard>
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Recursos y guías útiles</h3>
          </div>
        </template>

        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard
              v-for="(resource, index) in resources"
              :key="index"
              class="border border-gray-200 dark:border-gray-700"
            >
              <div class="p-4">
                <div class="flex items-start">
                  <UIcon
                    :name="resource.icon"
                    class="h-6 w-6 text-primary mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 class="font-semibold mb-1">{{ resource.title }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {{ resource.description }}
                    </p>
                    <UButton
                      :to="resource.link"
                      color="primary"
                      variant="ghost"
                      size="sm"
                    >
                      Ver recurso
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";

// Metadatos para SEO
definePageMeta({
  title: "Mi Juego",
  description:
    "Gestiona tu juego y consulta la información de tu temática reservada",
});

// Estado
const isLoading = ref(true);
const userGame = ref(null);
const themeDetails = ref(null);
const reservationDate = ref(null);
const resources = ref([
  {
    title: "Guía de desarrollo",
    description:
      "Aprende a desarrollar tu juego paso a paso con las herramientas recomendadas",
    icon: "i-heroicons-book-open",
    link: "/bases#desarrollo",
  },
  {
    title: "Recursos gráficos",
    description: "Encuentra recursos gráficos que puedes utilizar en tu juego",
    icon: "i-heroicons-photo",
    link: "/bases#recursos",
  },
  {
    title: "Ejemplos de juegos",
    description: "Explora juegos de ediciones anteriores para inspirarte",
    icon: "i-heroicons-play",
    link: "/juegos",
  },
  {
    title: "Preguntas frecuentes",
    description: "Respuestas a las dudas más comunes sobre el concurso",
    icon: "i-heroicons-question-mark-circle",
    link: "/faq",
  },
]);

// Hooks para obtener estado de autenticación
const { isAuthenticated: isLoggedIn, user, waitForAuthInitialized } = useAuth();
const toast = useToast();

// Determinar si el usuario tiene una temática reservada
const userHasTheme = computed(() => {
  console.log("[MisJuegos] Datos del usuario:", user.value);
  return user.value?.reservedTheme?.id ? true : false;
});

// Formatear fecha de reserva
const formatDate = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    // Si es timestamp de Firestore
    if (date && typeof date === "object" && date.seconds) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date.seconds * 1000));
    }

    // Si es un objeto Date
    if (date instanceof Date) {
      return new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }

    // Si es string, intentar convertir
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
    console.error("[MisJuegos] Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

// Función para extraer el número de la temática del ID
const getThemeNumber = (id) => {
  if (!id) return "N";
  // Asegurar que estamos trabajando con string
  const idStr = String(id);
  const numStr = idStr.replace(/\D/g, "");
  return numStr || "N";
};

// Cargar los datos del tema reservado por el usuario
const loadUserTheme = async () => {
  console.log("[MisJuegos] Estado de autenticación:", isLoggedIn.value);
  console.log(
    "[MisJuegos] Datos completos del usuario:",
    JSON.stringify(user.value)
  );

  if (!isLoggedIn.value || !user.value?.reservedTheme?.id) {
    console.log(
      "[MisJuegos] No hay tema reservado en el objeto usuario:",
      user.value?.reservedTheme
        ? JSON.stringify(user.value.reservedTheme)
        : "null"
    );
    isLoading.value = false;
    return;
  }

  try {
    const { $firestore } = useNuxtApp();
    const themeId = user.value.reservedTheme.id;
    reservationDate.value = user.value.reservedTheme.reservedAt;

    console.log("[MisJuegos] Cargando detalles de la temática:", themeId);

    // Obtener los detalles de la temática desde Firestore
    const themeDocRef = doc($firestore, "themes", themeId);
    const themeDoc = await getDoc(themeDocRef);

    if (themeDoc.exists()) {
      themeDetails.value = {
        ...themeDoc.data(),
        id: themeDoc.id,
      };
      console.log("[MisJuegos] Temática cargada:", themeDetails.value.title);
    } else {
      console.error("[MisJuegos] No se encontró la temática con ID:", themeId);
      toast.add({
        title: "Error",
        description: "No se pudo cargar la información de tu temática",
        color: "red",
      });
    }
  } catch (error) {
    console.error("[MisJuegos] Error al cargar la temática:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al cargar tu información",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// Función para refrescar los datos del usuario directamente desde Firestore
const refreshUserData = async () => {
  if (!isLoggedIn.value || !user.value?.uid) {
    console.log("[MisJuegos] No se puede refrescar: usuario no autenticado");
    return;
  }

  isLoading.value = true;
  console.log("[MisJuegos] Refrescando datos del usuario desde Firestore...");

  try {
    const { $firestore } = useNuxtApp();
    const userDocRef = doc($firestore, "users", user.value.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("[MisJuegos] Datos actualizados desde Firestore:", userData);

      // Si encontramos datos de reservedTheme en Firestore, actualizar y cargar temática
      if (userData.reservedTheme && userData.reservedTheme.id) {
        console.log(
          "[MisJuegos] Se encontró temática reservada en Firestore:",
          userData.reservedTheme
        );

        // Actualizar datos locales
        user.value = {
          ...user.value,
          reservedTheme: userData.reservedTheme,
        };

        // Cargar los detalles de la temática
        await loadUserTheme();

        // Mostrar mensaje de éxito
        toast.add({
          title: "Datos actualizados",
          description:
            "La información de tu temática ha sido cargada correctamente",
          color: "green",
        });

        return true;
      } else {
        console.log(
          "[MisJuegos] No se encontró temática reservada en Firestore"
        );
        toast.add({
          title: "Sin temática",
          description: "No se encontró ninguna temática reservada a tu nombre",
          color: "amber",
        });
      }
    } else {
      console.error(
        "[MisJuegos] No se encontró documento de usuario en Firestore"
      );
      toast.add({
        title: "Error",
        description: "No se pudo encontrar tu información de usuario",
        color: "red",
      });
    }

    return false;
  } catch (error) {
    console.error("[MisJuegos] Error al refrescar datos:", error);
    toast.add({
      title: "Error",
      description: "Ocurrió un error al actualizar tus datos",
      color: "red",
    });
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Inicializar
onMounted(async () => {
  console.log("[MisJuegos] Montando componente Mi Juego");

  // Esperar a que se inicialice la autenticación
  await waitForAuthInitialized();

  // Si el usuario está autenticado, cargar su temática
  if (isLoggedIn.value) {
    await loadUserTheme();

    // Si no se encontró temática en useAuth, intentar refrescar directamente desde Firestore
    if (!themeDetails.value && user.value?.uid) {
      console.log(
        "[MisJuegos] No se encontró temática en el objeto usuario, intentando refrescar desde Firestore..."
      );
      await refreshUserData();
    }
  } else {
    isLoading.value = false;
  }
});
</script>
