import { ref, computed } from "vue";
import {
  where,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  limit,
  where as whereFirestore,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export interface Theme {
  id: string;
  title: string;
  description: string;
  available: boolean;
  reservedBy?: string;
  reservedById?: string;
  reservedAt?: Date | string;
  createdAt: Date | string;
  image?: string;
  tags?: string[];
  category?: string; // Categoría principal
}

export function useThemes() {
  const {
    items: themes,
    loading,
    error,
    getDocuments,
    getDocumentById,
    updateDocument,
  } = useFirestore<Theme>("themes");

  const isLoading = ref(false);

  // Cargar todas las temáticas
  const fetchAllThemes = async () => {
    isLoading.value = true;
    try {
      await getDocuments([], { field: "id", direction: "asc" });
      // Imprimir los IDs disponibles para depuración
      console.log(
        "[useThemes] Temáticas cargadas con IDs:",
        themes.value.map((theme) => ({
          id: theme.id,
          type: typeof theme.id,
          available: theme.available,
          title: theme.title.substring(0, 20), // Solo los primeros 20 caracteres para brevedad
        }))
      );
    } catch (err) {
      console.error("Error al cargar temáticas:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar solo temáticas disponibles
  const fetchAvailableThemes = async () => {
    isLoading.value = true;
    try {
      await getDocuments([where("available", "==", true)], {
        field: "id",
        direction: "asc",
      });
    } catch (err) {
      console.error("Error al cargar temáticas disponibles:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar solo temáticas reservadas
  const fetchReservedThemes = async () => {
    isLoading.value = true;
    try {
      await getDocuments([where("available", "==", false)], {
        field: "id",
        direction: "asc",
      });
    } catch (err) {
      console.error("Error al cargar temáticas reservadas:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Cargar temáticas por categoría
  const fetchThemesByCategory = async (category: string) => {
    isLoading.value = true;
    try {
      await getDocuments([where("tags", "array-contains", category)], {
        field: "id",
        direction: "asc",
      });
    } catch (err) {
      console.error(
        `Error al cargar temáticas de la categoría ${category}:`,
        err
      );
    } finally {
      isLoading.value = false;
    }
  };

  // Buscar temáticas por texto
  const searchThemes = async (query: string) => {
    // Nota: Firestore no tiene búsqueda de texto nativa, así que hacemos la búsqueda en el cliente
    // Primero cargamos todas las temáticas y luego filtramos
    isLoading.value = true;
    try {
      await fetchAllThemes();
      return themes.value.filter(
        (theme) =>
          theme.title.toLowerCase().includes(query.toLowerCase()) ||
          theme.description.toLowerCase().includes(query.toLowerCase()) ||
          (theme.tags &&
            theme.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase())
            ))
      );
    } catch (err) {
      console.error("Error al buscar temáticas:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Función auxiliar para buscar una temática utilizando el ID numérico
  const findThemeByNumericId = async (numericId: string) => {
    const { $firestore } = useNuxtApp();
    const firestore = $firestore as Firestore;

    console.log(`[useThemes] Buscando tema con ID numérico: ${numericId}`);

    try {
      // Buscar primero en el estado local
      const localTheme = themes.value.find((theme) => {
        const themeNumericId = String(theme.id).replace(/\D/g, "");
        return themeNumericId === numericId;
      });

      if (localTheme) {
        console.log(
          `[useThemes] Tema encontrado localmente por ID numérico: ${numericId}`,
          {
            id: localTheme.id,
            title: localTheme.title,
          }
        );
        return {
          success: true,
          theme: localTheme,
          ref: doc(firestore, "themes", localTheme.id),
        };
      }

      // Si no se encuentra localmente, intentar buscar en Firestore
      // Esta consulta es menos eficiente, solo usarla como fallback
      const themesRef = collection(firestore, "themes");
      const q = query(themesRef, where("available", "==", true));
      const querySnapshot = await getDocs(q);

      // Filtrar los resultados para encontrar un tema con el ID numérico
      let matchingTheme = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const themeNumericId = String(doc.id).replace(/\D/g, "");
        if (themeNumericId === numericId) {
          matchingTheme = {
            id: doc.id,
            ...data,
          } as Theme;
        }
      });

      if (matchingTheme) {
        console.log(
          `[useThemes] Tema encontrado en Firestore por ID numérico: ${numericId}`,
          {
            id: matchingTheme.id,
            title: matchingTheme.title,
          }
        );
        return {
          success: true,
          theme: matchingTheme,
          ref: doc(firestore, "themes", matchingTheme.id),
        };
      }

      console.log(
        `[useThemes] No se encontró tema con ID numérico: ${numericId}`
      );
      return {
        success: false,
        error: "No se encontró la temática con ese número",
      };
    } catch (error) {
      console.error(
        `[useThemes] Error buscando tema con ID numérico: ${numericId}`,
        error
      );
      return {
        success: false,
        error: "Error al buscar la temática",
      };
    }
  };

  // Reservar una temática
  const reserveTheme = async (
    themeId: string,
    userId: string,
    userName: string
  ) => {
    isLoading.value = true;
    try {
      const { $firestore } = useNuxtApp();
      const firestore = $firestore as Firestore;

      // Asegurar que el ID es string
      const themeIdStr = String(themeId);
      const numericId = themeIdStr.replace(/\D/g, "");

      console.log("[useThemes] Intentando reservar temática:", {
        idRecibido: themeId,
        idComoString: themeIdStr,
        idNumerico: numericId,
        tipo: typeof themeId,
        tematicasDisponibles: themes.value.length,
        idsTematicas: themes.value.map((t) => t.id).slice(0, 5), // Mostrar los primeros 5 IDs
      });

      // 1. Verificar que el usuario no tenga ya una temática reservada
      const userRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Si el usuario ya tiene una temática reservada, no permitir otra reserva
        if (userData.reservedTheme) {
          return {
            success: false,
            error:
              "Ya tienes una temática reservada. No puedes reservar más de una temática por usuario.",
          };
        }
      }

      // 2. Buscar la temática usando nuestra función auxiliar
      const themeResult = await findThemeByNumericId(numericId);

      if (!themeResult.success) {
        return {
          success: false,
          error:
            themeResult.error || "La temática no existe o ha sido eliminada",
        };
      }

      const theme = themeResult.theme;
      const themeRef = themeResult.ref;

      // 3. Verificar que la temática está disponible
      if (!theme.available) {
        return {
          success: false,
          error: "Esta temática ya ha sido reservada por otro usuario",
        };
      }

      // 4. Actualizar la temática como reservada
      await updateDoc(themeRef, {
        available: false,
        reservedBy: userName,
        reservedAt: new Date(),
        reservedById: userId,
      });

      // 5. Actualizar el perfil del usuario con la referencia a la temática reservada
      await updateDoc(userRef, {
        reservedTheme: {
          id: theme.id,
          title: theme.title,
          reservedAt: new Date(),
        },
      });

      // Recargar las temáticas para reflejar los cambios
      await fetchAllThemes();

      return { success: true };
    } catch (err) {
      console.error("Error al reservar temática:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Error desconocido al reservar temática",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Obtener una temática por ID
  const getThemeById = async (id: string) => {
    try {
      // Asegurar que el ID es string
      const themeIdStr = String(id);
      return await getDocumentById(themeIdStr);
    } catch (err) {
      console.error(`Error al obtener temática con ID ${id}:`, err);
      return null;
    }
  };

  // Obtener todas las categorías únicas de las temáticas
  const getAllCategories = computed(() => {
    const categories = new Set<string>();

    themes.value.forEach((theme) => {
      if (theme.tags && theme.tags.length > 0) {
        theme.tags.forEach((tag) => categories.add(tag));
      }
    });

    return Array.from(categories).sort();
  });

  // Computed properties para filtrar temáticas
  const availableThemes = computed(() =>
    themes.value.filter((theme) => theme.available)
  );

  const reservedThemes = computed(() =>
    themes.value.filter((theme) => !theme.available)
  );

  // Agrupar temáticas por categoría
  const themesByCategory = computed(() => {
    const grouped: Record<string, Theme[]> = {};

    themes.value.forEach((theme) => {
      if (theme.tags && theme.tags.length > 0) {
        // Usar la primera etiqueta como categoría principal
        const mainCategory = theme.tags[0];

        if (!grouped[mainCategory]) {
          grouped[mainCategory] = [];
        }

        grouped[mainCategory].push(theme);
      } else {
        // Para temáticas sin etiquetas
        if (!grouped["Sin categoría"]) {
          grouped["Sin categoría"] = [];
        }

        grouped["Sin categoría"].push(theme);
      }
    });

    return grouped;
  });

  return {
    themes,
    availableThemes,
    reservedThemes,
    themesByCategory,
    getAllCategories,
    loading,
    error,
    isLoading,
    fetchAllThemes,
    fetchAvailableThemes,
    fetchReservedThemes,
    fetchThemesByCategory,
    searchThemes,
    reserveTheme,
    getThemeById,
  };
}
