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

      <!-- Equipo de desarrollo -->
      <UCard class="mb-8">
        <template #header>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold">Equipo de desarrollo</h3>
          </div>
        </template>

        <div class="p-6">
          <div class="space-y-6">
            <!-- Introducción -->
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Tu equipo de desarrollo puede tener hasta 2 integrantes. Puedes
              añadir un compañero proporcionando su correo electrónico.
            </p>

            <!-- Formulario de equipo -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Usuario principal -->
              <div class="bg-primary/5 rounded-lg p-4">
                <div class="flex items-center mb-4">
                  <UAvatar
                    :alt="user?.email || 'Usuario'"
                    size="lg"
                    class="mr-3"
                  />
                  <div>
                    <p class="font-semibold">Usuario principal</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ user?.email || "Correo no disponible" }}
                    </p>
                  </div>
                </div>
                <UBadge color="green" variant="subtle" class="font-medium">
                  Activo
                </UBadge>
              </div>

              <!-- Segundo usuario -->
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center mb-4">
                  <UAvatar
                    v-if="teammate"
                    :alt="teammate"
                    size="lg"
                    class="mr-3"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 mr-3"
                  >
                    <UIcon name="i-heroicons-user-plus" class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="font-semibold">Compañero de equipo</p>
                    <p
                      v-if="teammate"
                      class="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {{ teammate }}
                    </p>
                    <p v-else class="text-sm text-gray-500 dark:text-gray-500">
                      Sin compañero asignado
                    </p>
                  </div>
                </div>

                <div class="flex space-x-2">
                  <UInput
                    v-model="teammate"
                    type="email"
                    placeholder="Correo de tu compañero"
                    class="flex-grow"
                  />
                  <UButton
                    color="primary"
                    icon="i-heroicons-user-plus"
                    :disabled="!isValidEmail(teammate)"
                    @click="saveTeammate"
                  />
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div
              class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm"
            >
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-information-circle"
                  class="h-5 w-5 text-amber-500 mr-3 flex-shrink-0"
                />
                <div>
                  <p class="font-semibold mb-1">Importante</p>
                  <p class="text-gray-600 dark:text-gray-400">
                    Ambos integrantes deben estar registrados en la plataforma.
                    Tu compañero tendrá acceso de visualización a la información
                    del juego.
                  </p>
                </div>
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
const teammate = ref("");

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

  console.log("[MisJuegos] ID original recibido:", id, "tipo:", typeof id);

  // Si el tema tiene un campo 'numero', usarlo directamente y con prioridad
  if (themeDetails.value && themeDetails.value.numero !== undefined) {
    console.log("[MisJuegos] Usando campo numero:", themeDetails.value.numero);
    return themeDetails.value.numero;
  }

  // Asegurar que estamos trabajando con string
  const idStr = String(id);

  // Intentar extraer el número si el ID sigue un patrón como "tema1" o similar
  if (themeDetails.value && themeDetails.value.id) {
    const matches = themeDetails.value.id.match(/tema(\d+)/i);
    if (matches && matches[1]) {
      console.log(
        "[MisJuegos] Número extraído del patrón 'tema#':",
        matches[1]
      );
      return matches[1];
    }
  }

  // No extraer números de IDs aleatorios como "KBK7tnKqxiIcqvkHr3vN"
  // ya que eso produciría números incorrectos (73 en lugar de 1)

  // Valor por defecto: Si no podemos determinar el número, devolvemos "1"
  console.log("[MisJuegos] Usando valor por defecto: 1");
  return "1";
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

// Validar formato de correo electrónico
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Guardar compañero de equipo
const saveTeammate = async () => {
  if (!isValidEmail(teammate.value)) {
    toast.add({
      title: "Formato inválido",
      description: "Por favor ingresa un correo electrónico válido",
      color: "amber",
    });
    return;
  }

  isLoading.value = true;
  try {
    // Aquí implementaremos la lógica para guardar el compañero en Firestore
    // Por ahora mostramos un mensaje de éxito
    toast.add({
      title: "Compañero agregado",
      description: `${teammate.value} ha sido añadido a tu equipo de desarrollo`,
      color: "green",
    });
  } catch (error) {
    console.error("[MisJuegos] Error al guardar compañero:", error);
    toast.add({
      title: "Error",
      description: "No se pudo guardar el compañero de equipo",
      color: "red",
    });
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
